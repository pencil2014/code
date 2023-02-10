<template>
<div class="finance-page"
  v-loading="loading"
  :element-loading-text="eLoadingText"
  :element-loading-spinner="eLoadingSpinner"
  :element-loading-background="eLoadingBackground">
  <FinanceSearch
    :searchOption="searchOption1"
    @search="search"/>
  <div class="finance-search-list-gap">
  </div>
  <div class="finance-list-container">
    <div class="money-box">
      <div class="money-box-left">
        <el-button class="finance-btn"  @click="handleExport" size="mini"	>{{$t('Common.export')}}</el-button>
      </div>
      <div class="money-box-right">
        <el-button
          class="finance-btn"
          @click="refreshListPage"
          size="mini"
          type="primary"
        >{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <FinanceTableMass
      :option="option1"
      @send-multi="sendMulti"/>
  </div>
  <div v-if="customColumnsPopShow">
    <CustomColumns
      :columnsBase="selfColumnsBase"
      :configColumns="configColumns"
      @close="customColumnsPopClose" />
  </div>
</div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryWriteoffDzgMonitorPageList } from '@/api/fin/writeoffPay'
import { dateFormat } from '@/views/finance/utils/finance'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data(){
    return{
      keyDownActive: true,
      option1:{},
      searchOption1:{},
      loading:false,
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      //对比结果
      compareConsistent: [
        { label: '一致', value: 'yes' },
        { label: '不一致', value: 'no' }
      ],
      defaultColumns: [],
    }
  },
  created(){
    this.searchOption1 = {
      saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'compareConsistent', value: '', showType: '1' },
          { key: 'writeoffType', value: '', showType: '2' },
          { key: 'writeoffDate', value: '', showType: '3' },
        ],
        filterGroups: {
          compareConsistent: { label: '对比结果', type: 'select', selectOptions:this.compareConsistent, placeholder:  this.$t('Common.plSelect'), showType: '1' },
          writeoffReceipayNo: { label: '新系统核销编号', type: 'input',  showType: '1' },
          // dzgWriteoffReceipayNo: { label: '大掌柜核销编号', type: 'input', prop: 'yesNo',  showType: '1' },
          writeoffType: { label: this.$t('Payment.underwritType'), type: 'select', prop:'dzgMonitorWriteoffType', placeholder:  this.$t('Common.plEnter'), showType: '2' },
          writeoffDate: { label: this.$t('Hedge.writeoffTime'), type: 'daterange', placeholder:  this.$t('Common.plSelect'), showType: '3' },
        }
      }
    }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'WriteoffDzgMonitor',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns:Object.assign({}, this.option.operationBtns, {
        show: false
      }),
      pagination:Object.assign({}, this.option.pagination, {
        show: true, isNew: true
      }),
      sortChange: (column, prop, order) => {
				this.descColumns = order == 'descending' ? [prop] : []
				this.ascColumns = order == 'ascending' ? [prop] : []
				this.getData()
      },
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
    })
    this.selfColumnsBase = this.columnsBaseLocal = [ // let columns = 
      { prop: 'compareConsistent', label: '对比结果', type: 'select', selectOptions:this.compareConsistent },
      { prop: 'settleCompName', label: '结算分公司', sortable: false, type: 'text', width:150, },
      { prop: 'writeoffType', label: this.$t('Payment.underwritType'), sortable: false, type: 'select', propInDict:"dzgMonitorWriteoffType" },
      { prop: 'writeoffNos', label: '新系统核销编号', width:130,
        type: 'columnTip',component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetail({
              type: 'writeoffNos',
              no,
              componentProps,
            })
          }
        }
        // action: 'showAttachment',
        // operationBtns: {
        //   show: true,
        //   callback: (action, $index, row, option) => {
        //     if (action === 'showAttachment') {
        //       //收款核销
        //       if(row.writeoffType==="receive_writeoff"){
        //         const params = { writeoffNo: row.writeoffReceipayNo }
        //         const query = {
        //           source: 'writeoffRecv',
        //           receivableRegId: row.receivableRegId,
        //           writeoffReceipayId: row.writeoffReceipayId,
        //           writeoffReceipayNo: row.writeoffReceipayNo
        //         }
        //         this.routerPush('WriteoffRecvDetail2', query, true, params)
        //       }
        //       //付款核销
        //       if(row.writeoffType==="pay_writeoff"){
        //         this.routerPush('WritePayDetail', { writeoffReceipayNo: row.writeoffReceipayNo })
        //       }
        //       //对冲核销
        //       if(row.writeoffType==="gedging_writeoff"){
        //         this.routerPush('GedgingDetail',{
        //           source: 'gedgingDetail',
        //           gedgingApplyId: row.writeoffReceipayId
        //         })
        //       }
        //     }
        //   }
        // }
      },
      { prop: 'currency', label: '新系统币种', type: 'text', width: 102 },
      // { prop: 'writeoffAmt', label: '内部往来大掌柜金额', width: 140, type: 'text' },
      { prop: 'writeoffDate', label: this.$t('Hedge.writeoffTime'), type: 'text', width: 100 },
      // { prop: 'dzgWriteoffReceipayNo', label: '大掌柜核销编号', width:140, type: 'text' },
      // { prop: 'dzgCurrency', label: '大掌柜币种', type: 'text', width: 102 },
      // { prop: 'dzgWriteoffAmt', label: '大掌柜核销金额', type: 'text', width: 120 },
      { prop: 'differenceAmt', label: this.$t('Supplier.balance'), type: 'text' },
    ]
    this.defaultColumns = ['compareConsistent', 'settleCompName', 'writeoffType', 'writeoffNos', 'currency', 'writeoffAmt',
      'writeoffDate', 'dzgWriteoffReceipayNo', 'dzgCurrency', 'dzgWriteoffAmt', 'differenceAmt']
    // this.option1.columns = columns
    // this.getData()
  },
  methods:{
    getData(isSearch) {
      this.loading = true
      let data = {
        "currPage": this.option1.pagination.currPage,
        "pageSize": this.option1.pagination.pageSize,
        "columns": [],
				"ascColumns": this.ascColumns,
				"descColumns": this.descColumns,
        "query": []
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value } = item
        if (value) {
          if (value instanceof Array) {
            if (value.length === 0) {
              return
            }
            if (key === 'writeoffDate') {
              data.query.push({
                column: key+'Start',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
              })
              data.query.push({
                column: key+'End',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
              })
            }
          } else {
            data.query.push({
              column: key,
              type: 'eq',
              value: value,
            })
          }
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      queryWriteoffDzgMonitorPageList(data).then(res => {
        let { configColumns, list } = res.data
        this.columns = configColumns.length ? configColumns : this.defaultColumns
        let arr = []
        this.columns.forEach(column => {
          let obj = this.selfColumnsBase.find(item => {
            return item.prop === column
          })
          if (obj) {
            arr.push(obj)
          }
        })
        if(this.columnsBackup !== this.columns.toString()){
          this.option1.columns = arr
        }
        this.columnsBackup = this.columns.toString()
        list.forEach((item) => {
          item.writeoffNos_multiValue = item.writeoffReceipayNo ? item.writeoffReceipayNo.split(',') : []
        })
        this.option1.data = list
        Object.assign(this.option1.pagination, res.data)
        // this.option1.pagination.currPage = res.data.currPage
        // this.option1.pagination.pageSize = res.data.pageSize
        // this.option1.pagination.totalCount = res.data.totalCount
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    },
    handleSizeChange(val){
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val){
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },
    //导出按钮
		handleExport (isSearch) {
      let data = {
        "currPage": this.option1.pagination.currPage,
        "pageSize": this.option1.pagination.pageSize,
        "columns": [],
				"ascColumns": this.ascColumns,
				"descColumns": this.descColumns,
        "query": []
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value } = item
        if (value) {
          if (value instanceof Array) {
            if (value.length === 0) {
              return
            }
            if (key === 'writeoffDate') {
              data.query.push({
                column: key+'Start',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
              })
              data.query.push({
                column: key+'End',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
              })
            }
          } else {
            data.query.push({
              column: key,
              type: 'eq',
              value: value,
            })
          }
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.multipleSelection1.length) {
        data.query = [
          { column: 'dzgMonitorId', type: 'in', value: this.multipleSelection1.map((v) => v.dzgMonitorId).join(',') },
        ]
      }
			//查询对象的配置编码
      data.query.push({
				column: 'queryDataModuleCode',
				value: 'writeoffDzgMonitorListExport'
			})
			// this.$confirm('是否确认导出大掌柜核销列表?', "导出", {
      //   showCancelButton: true,
			// 	confirmButtonText: "确定",
			// 	cancelButtonText: "取消",
			// 	lockScroll: "true",
			// 	type: "warning",
      //   beforeClose: (action, instance, done) => {
      //     if (action === 'confirm') {
      //       instance.confirmButtonLoading = true;
      //       instance.confirmButtonText = '执行中...';
      //       setTimeout(() => {
      //         this.option1.loading = true
      //         this.$store
      //           .dispatch('finance/downloadBlobFilePost', {
      //             uri: '/fin/common/queryDataExportExcel',
      //             data: { data },
      //           })
      //           .then((res) => {
      //             this.option1.loading = false
      //             let link = document.createElement('a')
      //             link.href = window.URL.createObjectURL(res)
      //             link.download = '大掌柜核销列表.xlsx'
      //             link.click()
      //             done();
      //             instance.confirmButtonLoading = false;
      //           }).catch(() => {
      //             this.option1.loading = false
      //             this.$message({ message: '导出失败', type: 'error' })
      //             done();
      //             instance.confirmButtonLoading = false;
      //           })
      //       }, 10);
      //     } else {
      //       done();
      //       instance.confirmButtonLoading = false;
      //     }
      //   }
			// }).then(() => {
			// }).catch(() => {
			// })
		},
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns
  },
}
</script>

<style>

</style>