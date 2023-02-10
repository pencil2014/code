<!--
 * @Author: Sivan
 * @Date: 2022-06-13 10:37:44
 * @LastEditTime: 2022-06-20 18:41:39
 * @LastEditors: Sivan
-->
<template>
  <div
    class="finance-page"
    :element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
    v-loading="lsLoading"
  >
    <FinanceSearch :border="true" :searchOption="searchOption1" @search="search" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button @click="addMark" size="mini" type="primary" class="finance-btn"
              >新增</el-button
            >
          </el-button-group>
          <el-button-group>
            <el-button @click="startMark" type="success" size="mini" class="finance-btn"
              >启用</el-button
            >
          </el-button-group>
          <el-button-group>
            <el-button @click="stopMark" type="danger" size="mini" class="finance-btn"
              >禁用</el-button
            >
          </el-button-group>
        </div>
        <div class="money-box-right"></div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <Add :option="addDialog"  v-if="addDialog.show" @cancel="cancel" @submit="submit"/>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Add from './add'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { listPage, save, actived, limitList } from "@/api/fin/channelCode"
export default {
  mixins: [mixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
    Add
  },
  data() {
    return {
      lsLoading: false,
      searchOption1: {},
      option1: {},
      multipleSelection1: [],
      addDialog: {
        type: 'add',
        show: false,
        form: {
          thirdPayChannelCode: '',
          enable: '',
          limitedAmount: '',
          currency: ''
        }
      }
    }
  },
  created () {
    this.searchOption1 = {
      saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'thirdPayChannelCode', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'enable', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'currency', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'dateTime', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: {
          thirdPayChannelCode: { label: '标识码', type: 'input', showType: '1' },
          currency:  { label: '币种', type: 'select', showType: '1', propInDict: 'currency' },
          enable: { label: '状态', type: 'select', showType: '1',
            selectOptions: [
              { label: '有效', value: 'yes' },
              { label: '无效', value: 'no' }
            ]
          },
          dateTime: { label: '创建时间', type: 'daterange', showType: '1', ranges:['beginDate', 'endDate'], format: 'yyyy-MM-dd' },
        }
      }
    }
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '80px',
      data: [
        {
          label: '修改',
          type: 'text',
          show: true,
          action: 'Edit'
        }
      ],
      callback: (action, $index, row, item) => {
        if (action === 'Edit') {
          this.editMark(row)
        }
      }
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: {
        text: '',
        show: false
      },
      columns: [
        {
          prop: 'thirdPayChannelCode',
          label: '标识码',
          type: 'text',
          hasTag: true,
        }, 
        {
          prop: 'enable',
          label: '状态',
          type: 'text',
          formatter: ({cellValue}) => {
            return cellValue ? (cellValue === 'yes' ? '有效': '无效') : ''
          }
        },
        {
         prop: 'limitedAmount',
         label: '限额',
         type: 'text',   
        },
        {
         prop: 'currency',
         label: '币种',
         type: 'text',   
        },
        {
         prop: 'createdName',
         label: '创建人',
         type: 'text',   
        },
        {
         prop: 'createdTime',
         label: '创建时间',
         type: 'text',   
        },
        {
         prop: 'updatedName',
         label: '更新人',
         type: 'text',   
        },
        {
         prop: 'updatedTime',
         label: '更新时间',
         type: 'text',   
        },
      ],
      tips: {
        text: '',
        show: false
      },
      pagination,
      operationBtns,
    })
  },
  methods: {
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData (isSearch) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption1, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      listPage(data).then(res => {
        if (res.code === 0) {
          this.option1.data = (res.data.list || []).map(item => {
            if (item.enable === 'no') {
              item._isInvalid = true
              // item._tagArr = [{ text: "无", type: "change" }]
            }
            return item
          })
          Object.assign(this.option1.pagination, res.data)
        }
      }).finally(() => (this.lsLoading = false))
    },
    addMark() {
      this.addDialog.type = 'add'
      this.addDialog.show = true
    },
    startMark() {
      let len = this.multipleSelection1.length
      if (len < 1) {
        return this.$msgErrClose('请先选择需要操作的数据')
      }
      this.$confirmWarn('确认启用所选管理标识吗？', () => {
        this.startFn('yes')
      })
    },
    stopMark() {
      let len = this.multipleSelection1.length
      if (len < 1) {
        return this.$msgErrClose('请先选择需要操作的数据')
      }
      this.$confirmWarn('确认禁用所选管理标识吗？', () => {
        this.startFn('no')
      })
    },
    startFn (type) {
      let oids =  this.multipleSelection1.map(item => item.oid)
      let data = {
        oids,
        enable: type
      }
      this.lsLoading = true
      actived(data).then(res => {
        if (res.code === 0) {
          this.getData()
          let text = type === 'yes' ? '启用标识码成功' : '禁用标识码成功'
          this.$msgSucClose(text)
        }
      }).catch(()=>{}).finally(()=>{
         this.lsLoading = false
      })
    },
    editMark (row) {
      this.addDialog.type = 'edit'
      this.addDialog.form = Object.assign(this.addDialog.form, row)
      this.addDialog.show = true
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    cancel () {
      this.addDialog.show = false
    },
    submit (data) {
      this.lsLoading = true
      save(data).then(res => {
        if (res.code === 0) {
          this.getData()
          let text =  this.addDialog.type === 'edit' ? '编辑标识码成功' : '新增标识码成功'
          this.$msgSucClose(text)
          this.cancel()
        }
      }).catch(()=>{})
      .finally(()=> {
        this.lsLoading = false
      })
      
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
  },
}
</script>

<style lang="scss" scoped></style>
