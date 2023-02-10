<template>
  <div class="finance-table" :class="{'max__height__table':$attrs.autoMax}" :id="option.id || 'option1'">
    <ListAmtSummary v-if="option.listAmtSummary && option.listAmtSummary.show && (!option.listAmtSummary.isPlaceBottom || option.listAmtSummary.isPartTop)" :listAmtSummary="option.listAmtSummary" :place="'top'" @handle-collapse="handleCollapse" />
    <div class="finance-el-table" :style="option.style||{}">
      <!-- <Tips v-if="tips" :tips="tips" :callback="handleTableClearSelection" /> -->
      <!-- 虽然设置了invisible元素display：none，但是显示异常，直接过滤掉 -->
      <vxe-table
        v-if="showXTable && option.columns"
        ref="xTable1"
        resizable
        :empty-text="option.emptyText || '暂无数据'"
        :show-header-overflow="(option.showOverflow === false || option.showHeaderOverflow === false) ? false : true"
        :show-overflow="option.showOverflow === false ? false : true"
        :tooltip-config="{contentMethod: showTooltipMethod, enterable: true}"
        highlight-hover-row
        :header-cell-class-name="headerCellClassName"
        :row-class-name="rowClassNameFunc"
        :cell-class-name="cellClassNameFunc"
        :show-footer="option.showFooter"
        :stripe="!!option.stripe || false"
        :footer-method="(params)=> option.footerMethod&&option.footerMethod(params)"
        size="mini"
        border=inner
        :max-height='option.maxHeight || 500'
        :data='option.data.filter(v => !v.invisible)'
        :sort-config="{remote: (option.sortRemote === false ? false : true)}"
        :span-method="option.spanMethod"
        :scroll-y="{enabled: option.scrollY ? (option.scrollY.enabled === false ? false : true) : true , gt: option.scrollY && option.scrollY.gt || 99}"
        :checkbox-config="{checkMethod: ({row})=>!row._checkDisabled}"
        @selection-change="handleMulti"
        @sort-change="({ column, property, order }) => {if (order === 'asc') {order = 'ascending'} else if (order === 'desc') {order = 'descending'}let prop = property;option.sortChange && option.sortChange(column, prop, order, option)}"
        @checkbox-all="selectAllEvent"
        @checkbox-change="selectChangeEvent"
        @cell-click="cellClickEvent"
        @resizable-change="resizableChange"
        @scroll="scrollEvent"
        row-id
      >
        <vxe-column
          v-if="option.selection && option.selection.show"
          type="checkbox"
          :width="option.selection.width || 30"
          :fixed="option.selection.fixed ? 'left' : 'left'"
          :resizable="option.selection.resizable === false ? false : true"
        ></vxe-column>
        <vxe-column
          v-if="option.customColumns && option.customColumns.show"
          :width="option.customColumns.width||30"
          :fixed="'left'"
          :resizable="true">
          <template #header>
            <el-tooltip :content="'自定义表头'" placement="top">
              <i class="el-icon-setting finance-icon-custom-columns" @click="option.customColumns && option.customColumns.handleCustomColumns()"></i>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <div class="td_tag_div" v-if="row._tagArr">
              <span
                class="finance-self-tag"
                v-for="tag in row._tagArr || []"
                :class="[tag.type]"
                :key="tag.type"
              >{{tag.text}}</span>
            </div>
          </template>
        </vxe-column>
        <vxe-column
          v-if="option.index && option.index.show"
          :title="option.index.title || '序号' "
          :width="option.index && option.index.width || 40"
          :fixed="'left'"
          :resizable="true || option.index && option.index.resizable === true ? true : false"
        >
          <template #default="{ rowIndex }">
            <span>{{rowIndex + 1}}</span>
          </template>
        </vxe-column>
          <!-- :show-overflow="option.showOverflow === false || item.type === 'upload' ? false : true" -->
        <vxe-column
          v-for="(item, index) in columns"
          :key="item.prop"
          :title="item.label"
          :field="item.prop"
          :min-width="item.minWidth || 80"
          :width="item.forceWidth || (columns.length < 15 && parseInt(item.width) < 100 && parseInt(item.width) > 60 ? '' : item.width)"
          :params="item"
          :fixed="(!option.disableFixedIndex0 && index === 0) ? 'left' : item.fixed"
          :formatter="item.formatter || formatterCommon"
          :sortable="option.sortable && item.sortable !== false"
          :resizable="item.resizable === false ? false : true"
          :class-name="columnClassNameFunc"
        >
        <!-- item.formatterX || item.formatter ||  -->
        <!-- 利用item，将所有值赋值给params -->
        <!-- :params="{'type': item.type, 'propInDict': item.propInDict, 'required': item.required}" -->
        <!-- :show-overflow="(item.showOverflow === false ? false : true) && item.type !== 'columnTip'" -->
          <template v-if="item.headerSign" #header>
            <span style="margin-right:4px;">{{item.label}}</span>
            <el-tooltip :content="item.headerSign.text || ''" placement="top">
              <i class="finance-icon-custom-columns" :class="item.headerSign.iconClass || 'el-icon-question'"></i>
            </el-tooltip>
          </template>
          <template #default="{ row, column, rowIndex }">
            <FinanceColumn :ref="'column_'+item.prop" :option="option" :item="item" :index="index" :row="row" :column="column" :rowIndex="rowIndex" />
          </template>
        </vxe-column>
        <!-- 多表头，只做了普通渲染和按钮 -->
        <vxe-table-colgroup
          :title="colgroup.title"
          v-for="(colgroup,index) in colgroups"
          :key="'colgroups'+index"
          :header-class-name="'colgroup_diy_'+colgroup.className">
          <vxe-column
            v-for="(item, index) in colgroup.columns.filter(subItem => subItem)"
            :key="item.prop+index"
            :title="item.label"
            :field="item.prop"
            :min-width="item.minWidth || 80"
            :width="item.width"
            :params="{'type': item.type, 'propInDict': item.propInDict}"
            :formatter="item.formatter || formatterCommon"
            :sortable="option.sortable && item.sortable !== false"
            :resizable="item.resizable === false ? false : true"
          >
          <!-- item.formatterX || item.formatter ||  -->
            <template #default="{ row, column, rowIndex }">
              <FinanceColumn :option="option" :item="item" :index="index" :row="row" :column="column" :rowIndex="rowIndex" />
            </template>
          </vxe-column>
        </vxe-table-colgroup>
        <vxe-column
          v-for="(item, index) in columns2"
          :key="item.prop"
          :title="item.label"
          :field="item.prop"
          :min-width="item.minWidth || 80"
          :width="columns2.length < 15 && parseInt(item.width) < 100 && parseInt(item.width) > 60 ? '' : item.width"
          :params="item"
          :fixed="item.fixed ? item.fixed : ''"
          :formatter="item.formatter || formatterCommon"
          :sortable="option.sortable && item.sortable !== false"
          :resizable="item.resizable === false ? false : true"
        >
          <template #default="{ row, column, rowIndex }">
            <FinanceColumn :option="option" :item="item" :index="index" :row="row" :column="column" :rowIndex="rowIndex" />
          </template>
        </vxe-column>
        <vxe-table-colgroup
          :title="colgroup.title"
          v-for="(colgroup,index) in colgroups2"
          :key="'colgroups'+index"
          :header-class-name="'colgroup_diy_'+colgroup.className">
          <vxe-column
            v-for="(item, index) in colgroup.columns.filter(subItem => subItem)"
            :key="item.prop+index"
            :title="item.label"
            :field="item.prop"
            :min-width="item.minWidth || 80"
            :width="item.width"
            :params="{'type': item.type, 'propInDict': item.propInDict}"
            :formatter="item.formatter || formatterCommon"
            :sortable="option.sortable && item.sortable !== false"
            :resizable="item.resizable === false ? false : true"
          >
            <template #default="{ row, column, rowIndex }">
              <FinanceColumn :option="option" :item="item" :index="index" :row="row" :column="column" :rowIndex="rowIndex" />
            </template>
          </vxe-column>
        </vxe-table-colgroup>
        <vxe-column
          v-for="(item, index) in columns3"
          :key="item.prop"
          :title="item.label"
          :field="item.prop"
          :min-width="item.minWidth || 80"
          :width="columns3.length < 15 && parseInt(item.width) < 100 && parseInt(item.width) > 60 ? '' : item.width"
          :params="item"
          :fixed="item.fixed ? item.fixed : ''"
          :formatter="item.formatter || formatterCommon"
          :sortable="option.sortable && item.sortable !== false"
          :resizable="item.resizable === false ? false : true"
        >
          <template #default="{ row, column, rowIndex }">
            <FinanceColumn :option="option" :item="item" :index="index" :row="row" :column="column" :rowIndex="rowIndex" />
          </template>
        </vxe-column>
        <!-- 设置show-overflow="false"，无default样式，pagdding值不生效，溢出时手动设置宽度 -->
          <!-- :show-overflow="false" -->
        <vxe-column
          v-if="option.operationBtns&&option.operationBtns.show"
          :title="option.operationBtns.title || '操作'"
          :width="option.operationBtns.width"
          :fixed="option.operationBtns.fixed || 'right'"
          :resizable="option.operationBtns && option.operationBtns.resizable === true ? true : false"
        >
          <template #default="{ row, rowIndex }">
            <template v-for="(item, index) in option.operationBtns.data">
              <span
                :key="'operationBtns' + index"
                class="operationbtns-wrapper"
                v-if="(item.show || item.showFn(row)) || (!item.showFn && row.edit)"
              >
              <!-- v-if="row.edit || item.show || item.showFn(row)" -->
                <el-button
                  type="text"
                  :style="item.style||{color:item.colorType==='edit'?'#EDB534':item.colorType==='cancel'?'#cd4130':item.colorType==='pass'?'#33B18A':'#1890ff'}"
                  @click.stop="option.operationBtns.callback(item.action, rowIndex, row, option)"
                >{{item.label}}</el-button>
                <!-- style="margin:0" -->
              </span>
            </template>
          </template>
        </vxe-column>
        <template v-if="option.diyEmpty" #empty>
          <slot name="empty"></slot>
        </template>
      </vxe-table>
    </div>
    <ListAmtSummary v-if="option.listAmtSummary && option.listAmtSummary.show && option.listAmtSummary.isPlaceBottom" :listAmtSummary="option.listAmtSummary" :place="'bottom'" @handle-collapse="handleCollapse" />
    <div class="finance-el-pagination" v-if="option.pagination && option.pagination.show">
      <Tips v-if="tips && tips.show !== false && option.selection.show !== false" :tips="tips" :callback="handleTableClearSelection" />
      <div class="pagination-container">
        <!-- <el-pagination
          size="mini"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="option.pagination.currPage"
          :page-size="option.pagination.pageSize"
          :total="Number(option.pagination.totalCount)"
          :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
          :pager-count="5"
          layout="total, prev, pager, next, jumper, sizes"
        ></el-pagination> -->
        <Pagination :config="option" :tableQuery="tableQuery" :callback="tableCallBack" />
      </div>
    </div>
    <div class="finance-tips-container" v-else>
      <Tips v-if="tips && tips.show !== false && option.selection.show !== false" :tips="tips" :callback="handleTableClearSelection" />
    </div>
    <component :is="currentComponent" :component-props="componentProps">
    </component>
  </div>
</template>
<script>
import Tips from '@/views/finance/components/Tips/index'
import ListAmtSummary from '@/views/finance/components/financeTableMass/listAmtSummary'
import FinanceColumn from '@/views/finance/components/financeTableMass/financeColumn'
import Pagination from "@/components/Base/Table/newPagination"

import { mapGetters } from 'vuex'
// const COLORFUL = {
//   // 绿色 应收、通过、是
//   // 红色 应付、拒绝、否
//   // 黄色 待审核、
//   // 与字典的值相对应，查看dictMapObj,将字段的值改为颜色值即可
//   // 有propInDict设置propInDict的值， 无propInDict设置prop的值
//   // 收付类型 
//   receipayType: {receive: 'green', pay: 'red', receivepay: 'yellow', },
//   // yesNo 
//   yesNo: {yes: 'green', no: 'red', },
//   // 审核状态 
//   auditStatus: {pass: 'green', refuse: 'red', pending: 'yellow', },
// }
// const COLORKEYS = Object.keys(COLORFUL)
export default {
  name: 'financeTableMass',
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
		tableQuery: {
			type: Object,
			default: () => ({})
		},
  },
  data() {
    return {
      // TODO 暂时按需求改，不必全局配置，待全局改再激活配置
      COLORFUL: {
        // 绿色 应收、通过、是
        // 红色 应付、拒绝、否
        // 黄色 待审核、
        // 与字典的值相对应，查看dictMapObj,将字段的值改为颜色值即可
        // 有propInDict设置propInDict的值， 无propInDict设置prop的值
        // 收付类型 
        receipayType: {receive: 'red', pay: 'green', receivepay: 'yellow', },
        // 收付类型 
        receipayGroup:{receive: 'red', pay: 'green', },
        // yesNo 
        yesNo: {yes: 'green', no: 'red', },
        // 审核状态 
        auditStatus: {pass: 'green', refuse: 'red', pending: 'yellow', },
        // 核销状态 
        writeoffStatus: {finish: 'green', nofinish: 'red', part_finish: 'yellow', },
        // 发票状态 
        feeInvoiceStatus: {finish: 'green', nofinish: 'red', part_finish: 'yellow', },
        // 财务状态 
        finLockStatus: {unlock: 'green', lock: 'red', },
        // 结算状态 
        feeSettleStatus: {finish: 'green', nofinish: 'red', part_finish: 'yellow', },
        // 开票状态 
        invoiceApplyStatus: {all_invoice: 'green', close: 'red', part_invoice: 'yellow', },
        // 发票状态 
        invoiceStatus: {normal: 'green', rush_red: 'red', cancel: 'yellow', },
        // 发票状态 
        voucherStatus: {yes: 'green', no: 'red', },
      },
      tips: this.option.tips,
      multipleSelection: [],
      showUploadBtn: true,
      defaultFileSize: 5,
      financeTableUpload: null,
      currentComponent: '',
      componentProps: {},
      scrollTop: 0,
      scrollLeft: 0,
      showXTable: true,
      rowIndex: 0,
      columnIndex: 0,
      // taxRateSelectOptions: [
      //   { label: '0%', value: 0 },
      //   { label: '3%', value: 0.03 },
      //   { label: '6%', value: 0.06 },
      //   { label: '9%', value: 0.09 },
      //   { label: '13%', value: 0.13 },
      //   { label: '17%', value: 0.17 }
      // ],
    }
  },
  computed: {
    columns() {
      if (this.option.columns) {
        let name = this.option.$name ? this.option.$name : this.option.id ? this.$route.name + '_' + this.option.id : this.$route.name + '_option1'
        let financeTablesInfoStr = window.localStorage.getItem('financeTablesInfoStr')
        return this.option.columns.filter(item => {
          if (name && financeTablesInfoStr && item) {
            let financeTablesInfo = JSON.parse(financeTablesInfoStr)
            let arr = financeTablesInfo[name]
            arr = arr ? arr : []
            let f = arr.find(item2 => {
              return item2 && item2.prop === item.prop
            })
            if (f) {
              item.width = f.width
            }
          }
          return item && item.showVerticalColumn !== false && !item.hide
        })
      } else {
        return []
      }
    },
    colgroups() {
      if (this.option.colgroups) {
        let name = this.option.$name ? this.option.$name : this.option.id ? this.$route.name + '_' + this.option.id : this.$route.name + '_option1'
        let financeTablesInfoStr = window.localStorage.getItem('financeTablesInfoStr')
        return this.option.colgroups.filter(colgroup => {
          if (name && financeTablesInfoStr && colgroup) {
            let financeTablesInfo = JSON.parse(financeTablesInfoStr)
            let arr = financeTablesInfo[name]
            arr = arr ? arr : []
            colgroup.columns.forEach(item => {
              let f = arr.find(item2 => {
                return item2 && item2.prop === item.prop
              })
              if (f) {
                item.width = f.width
              }
            })
          }
          return colgroup && colgroup.showVerticalColumn !== false && !colgroup.hide
        })
      } else {
        return []
      }
    },
    columns2() {
      if (this.option.columns2) {
        let name = this.option.$name ? this.option.$name : this.option.id ? this.$route.name + '_' + this.option.id : this.$route.name + '_option1'
        let financeTablesInfoStr = window.localStorage.getItem('financeTablesInfoStr')
        return this.option.columns2.filter(item => {
          if (name && financeTablesInfoStr && item) {
            let financeTablesInfo = JSON.parse(financeTablesInfoStr)
            let arr = financeTablesInfo[name]
            arr = arr ? arr : []
            let f = arr.find(item2 => {
              return item2 && item2.prop === item.prop
            })
            if (f) {
              item.width = f.width
            }
          }
          return item && item.showVerticalColumn !== false && !item.hide
        })
      } else {
        return []
      }
    },
    colgroups2() {
      if (this.option.colgroups2) {
        let name = this.option.$name ? this.option.$name : this.option.id ? this.$route.name + '_' + this.option.id : this.$route.name + '_option1'
        let financeTablesInfoStr = window.localStorage.getItem('financeTablesInfoStr')
        return this.option.colgroups2.filter(colgroup => {
          if (name && financeTablesInfoStr && colgroup) {
            let financeTablesInfo = JSON.parse(financeTablesInfoStr)
            let arr = financeTablesInfo[name]
            arr = arr ? arr : []
            colgroup.columns.forEach(item => {
              let f = arr.find(item2 => {
                return item2 && item2.prop === item.prop
              })
              if (f) {
                item.width = f.width
              }
            })
          }
          return colgroup && colgroup.showVerticalColumn !== false && !colgroup.hide
        })
      } else {
        return []
      }
    },
    columns3() {
      if (this.option.columns3) {
        let name = this.option.$name ? this.option.$name : this.option.id ? this.$route.name + '_' + this.option.id : this.$route.name + '_option1'
        let financeTablesInfoStr = window.localStorage.getItem('financeTablesInfoStr')
        return this.option.columns3.filter(item => {
          if (name && financeTablesInfoStr && item) {
            let financeTablesInfo = JSON.parse(financeTablesInfoStr)
            let arr = financeTablesInfo[name]
            arr = arr ? arr : []
            let f = arr.find(item2 => {
              return item2 && item2.prop === item.prop
            })
            if (f) {
              item.width = f.width
            }
          }
          return item && item.showVerticalColumn !== false && !item.hide
        })
      } else {
        return []
      }
    },
    ...mapGetters(['dictMapObj']),
  },
  created() {
    // console.log('option: ', this.option)
    console.log(this.dictMapObj)
    // 组件构造函数是 VueComponent, VueComponent构造函数才是Vue
    this.__proto__.__proto__.__table__ = this
  },
  mounted() {
    window._settleUnitSubType = this.dictMapObj.settleUnitSubType
    // 会引起开票申请发票列表死循环
    this.$nextTick(() => {
      // console.log(this.option.pagination);
      if(this.option.pagination && this.option.pagination.show){
        this.option.__vm__ = this
        // this.option.__tableRef = this.$refs.xTable1
      }
    })
  },
  methods: {
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleCollapse(val) {
      this['show' + val] = !this['show' + val]
      if (val === 'ListAmtSummary' && this.option.listAmtSummary.count === 1) {
        this.$emit('send-multi', [], this.option) // 使getListAmtSummary获取数据
      }
    },
    formatterCommon(cell) {
      // if (cell.column.property === 'confirmStatus') {
      //   console.log('cell:', cell)
      //   console.log('this.columns:', this.columns)
      // }
      // 只需打印一次
      if(!window.isConsoled){
        window.isConsoled = true
        console.log('cell:', cell)
      }
      let { cellValue = '', column, row, item } = cell
      let { property, params } = column
      // 针对凭证管理 汇率类型 为固定值，其它有默认的值可以参考此用法
      if(params && params.defaultVal && !params.prop){
        return params.defaultVal
      }
      let prop = property
      let { type, propInDict, isForceSelect } = params
      // 如果返回值为null, undefined, 0 时需要特殊处理
      if(!cellValue) cellValue = cellValue === 0 ? 0 : ''
      cellValue += ''
      if (prop === 'currency') {
        return cellValue
      } if (type === 'select' || isForceSelect) {
        let dict = propInDict ? this.dictMapObj[propInDict] : this.dictMapObj[prop]
        let { multi, selectOptions, forceSelection, selectOptionsObj } = item || {}
        if (dict && !forceSelection) {
          if(multi){
            // noDict 字典内无值时，不进行渲染，有历史数据不需显示
            let noDict = item && item.noDict
            return (cellValue+'').replace(/\b(\w+)\b/g, (item) => ((dict && dict[item]) || (noDict?'':item))).replace(/(,+)/g,',')
          }
          // TODO 暂时按需求改，不必全局配置，待全局改再激活配置
          // let COLORKEYS = Object.keys(this.COLORFUL)
          let COLORKEYS = this.option.colorColumns || []
          // 字典内有值， 且未激活forceSelection(作用是强制使用selectOptions)
          if(propInDict){
            if(COLORKEYS.includes(propInDict)) return this.dealStatusColor(propInDict, cellValue)
          }else{
            if(COLORKEYS.includes(prop)) return this.dealStatusColor(prop, cellValue)
          }
          return dict[(cellValue+'').toLowerCase()] || cellValue
        } else if (selectOptions) {
          if(multi){
            return (cellValue+'').replace(/\b(\w+)\b/g, (item) => (selectOptionsObj && selectOptionsObj[item]))
          }
          let obj = selectOptions.find((item) => (item.value + '').toLowerCase() === (cellValue+'').toLowerCase())
          obj = obj && obj.label
          return obj || cellValue
        } else {
          return item && item.noDict ? '' : cellValue
        }
      } else {
        return cellValue
      }
    },
    dealStatusColor(prop, val){
      let dict =this.dictMapObj[prop] 
      if(!this.COLORFUL[prop]) return console.err('未配置颜色');
      return `<span class="ls_${this.COLORFUL[prop][val]}">${dict[val]||''}</span>`
    },
    renderNoEdit(row, item) {
      let { formatter, prop, type, selectOptions, selectOptionsObj, propInDict, defaultVal } = item
      if (defaultVal) {
        return defaultVal
      }
      if (formatter) {
        return formatter(row, item)
      } else if (type === 'select' && !item.remote) {
        // 后端返回* 凭证管理
        if (row[prop] === '*') {
          return '*'
        }
        // 新增字典对象dictMapObj，不再遍历字典dictMap来匹配值，遍历数组消耗大
        // 自定义selectOption时，自定义selectOptionsObj {[value]:label}
        let dict = selectOptionsObj || this.dictMapObj[propInDict] || this.dictMapObj[prop]
        let rowProp = (row[prop] + '').toLowerCase()
        let obj
        if (selectOptions) {
          obj = selectOptions.find((item) => (item.value + '').toLowerCase() === rowProp)
          console.log(obj);
          obj = obj && obj.label
        } else if (dict) {
          if (item.multi) {
            // 后端返回多字符串supplier,customer转化对应字典 结算单位
            obj = row[prop].replace(/\b(\w+)\b/g, (item) => (dict && dict[item]) || rowProp)
          } else {
            obj = dict && dict[rowProp]
          }
        }
        return obj || row[prop]
      } else if (type === 'select' && item.remote) {
        let propName = prop.replace('Code', 'Name')
        if (propName && row[propName]) {
          return row[propName]
        } else {
          return row[prop]
        }
      } else {
        return row[prop]
      }
    },
    cellClickEvent({ row, column, triggerCheckbox, rowIndex, columnIndex, $event}) {
      if (!!this.getSelected()) {
        return
      }
      let ELSELEDROPDWS = document.querySelectorAll('body > .el-select-dropdown')
      for(let i=0; i<ELSELEDROPDWS.length; i++) {
        if (ELSELEDROPDWS[i] && ELSELEDROPDWS[i].style.display !== 'none') return
      }
      if(this.option.handleCellClick){
        this.option.handleCellClick({ row, column, triggerCheckbox, rowIndex, columnIndex, $event})
        return
      }
      // triggerCheckbox表示是否是checkbox触发
      if (!triggerCheckbox && this.option.noClickCheck !== true) {
        if (this.option.edit && this.option.noCheckWhenEdit) { // 在业务费用、专项管理费、费用单详情等页面，当处于编辑状态时，使点击勾选的功能不生效
        } else {
          this.$refs.xTable1.toggleCheckboxRow(row)
          // let records = this.$refs.xTable1.getCheckboxRecords()
          this.setIsRowChecked()
        }
        this.option.data.forEach(item => {
          item.$isRowClick = false
        })
        row.$isRowClick = true
        let records = this.$refs.xTable1.getCheckboxRecords()
        // 时间戳，用于记录勾选的先后顺序，生成凭证需要按勾选排序
        // row.$isRowCheck为true表示选中，添加时间戳，为false表示取消，时间戳设为0
        // 此行代码一定放到getCheckboxRecords()后
        row.diyTimeStamp = row.$isRowCheck ? +new Date() : 0
        this.handleMulti(records)
      }
    },
    getSelected() {
      if (window.getSelection) {
        return window.getSelection().toString()
      }
    },
    setIsRowChecked () {
      // console.log('````````setIsRowChecked', checked);
      let records = this.$refs.xTable1.getCheckboxRecords()
      this.option.data.forEach(item => {
        item.$isRowCheck = false
      })
      records.forEach(item => {
        item.$isRowCheck = true
      })
    },
    setCheckRow (row, isChecked) {
      this.$refs.xTable1.setCheckboxRow(row, isChecked)
      this.debounceLs(() => {
        this.setIsRowChecked()
        let records = this.$refs.xTable1.getCheckboxRecords()
        // row.$isRowCheck为true表示选中，添加时间戳，为false表示取消，时间戳设为0
        row.diyTimeStamp = row.$isRowCheck ? +new Date() : 0
        this.handleMulti(records)
      }, 10)
    },
    selectAllEvent({ checked, records }) {
      this.setIsRowChecked()
      // checked===false 表示取消全选，清空时间戳
      if(checked===false){
        this.option.data.forEach(v=> v.diyTimeStamp = 0)
      }
      // 遍历所选项，时间戳不为0表示已选并保持时间戳，为0则表示未选变已选，赋值时间戳
      records.forEach(v=> v.diyTimeStamp = v.diyTimeStamp || +new Date())
      this.handleMulti(records)
    },
    selectChangeEvent({ checked, records, row }) {
      this.setIsRowChecked()
      // row.$isRowCheck为true表示选中，添加时间戳，为false表示取消，时间戳设为0
      // 此行代码一定放到setIsRowChecked()后
      row.diyTimeStamp = row.$isRowCheck ? +new Date() : 0
      this.handleMulti(records)
    },
    // 取消多选
    handleTableClearSelection(action) {
      // 未进入此方法
      // this.option.data.forEach(v=>v.diyTimeStamp=0)
      this.$refs.xTable1.clearCheckboxRow()
      this.handleMulti([])
      // this.callback(action)
    },
    // 选择触发
    handleMulti(data) {
      // console.log(data.map(v=>v.diyTimeStamp));
      // console.log(data);
      this.multipleSelection = data
      // console.log(this.tips);
      if (this.tips && !this.option.rootTipsHide) {
        Object.assign(
          this.tips,
          {
            // invisible表示隐藏， 隐藏的数据不应该计算在内
            show: data.filter(v => !v.invisible).length ? true : false,
            text: data.filter(v => !v.invisible).length ? `已选择 ${data.filter(v => !v.invisible).length} 项` : '',
          }
        )
      }
      // 不需要按时间戳排序 needTimeSort 默认undefined , 需要排序则设置 needTimeSort 为true
      if(!this.option.needTimeSort){
        this.$emit('send-multi', [...data], this.option)
        return
      }
      // 将data按照时间戳从小到大排序
      this.$emit('send-multi', [...data].sort((a,b)=>a.diyTimeStamp-b.diyTimeStamp), this.option)
    },
    headerCellClassName({ column, columnIndex }) {
      let params = column && column.params
      if (params && params.required) {
        return 'ls-vxe-th fin-required'
      }
      return 'ls-vxe-th'
    },
    rowClassNameFunc({ row, rowIndex }) {
      if (row._isChanged) {
        return 'finance-table-row-changed'
      }
      if (row._isChangedFee) {
        return 'finance-table-row-changed-fee'
      }
      if (row._isInvalid || row._checkDisabled) {
        return 'finance-table-row-invalid'
      }
      if (row._isPassed) {
        return 'finance-table-row-passed'
      }
      if (row._isRefused) {
        return 'finance-table-row-refused'
      }
      if (row.invisible) {
        return 'finance-table-row-invisible'
      }
      if (row._isWarning) {
        return 'finance-table-row-warning'
      }
      if (row.redMark) {
        return 'finance-table-row-redmark'
      }
      if (row.$isRowDelete) {
        return 'delete-row-class'
      }
      // 多选选中样式
      if (this.multipleSelection && this.multipleSelection.indexOf(row) > -1) {
        return 'select-row-class'
      }
    },
    columnClassNameFunc({row, column}){
      let params = column && column.params
      if(params.className) return params.className
    },
    // 单元格样式
    cellClassNameFunc({ row, rowIndex, column, columnIndex }) {
      let {params} = column
      if(!this.isConsoled2 && params && params.hasTag){
        this.isConsoled2 = true
        console.log('params:', params)
      }
      if(params && params.hasTag){
        return 'td_has_tag'
      }
      if (row.isRequiredNull && params && params.required) {
        return 'is-error-container-fin'
      }
      if (row.hasSpecialCellClassName && params && params.specialCellClassName) {
        return params.specialCellClassName
      }
    },
    handleRowClick(row, column) { // 未使用
      // selection.show为false，不存在复选框  row._disabled 表示此行禁选
      if (!this.option.selection.show || row._disabled) {
        return
      }
      let index = this.multipleSelection.indexOf(row)
      if (index === -1) {
        this.$refs.tableLayout_finance.toggleRowSelection(row, true)
      } else {
        this.$refs.tableLayout_finance.toggleRowSelection(row, false)
      }
    },
    resizableChange(params) {
      // console.log(params)
      console.log(this.option.$name)
      let name = this.option.$name ? this.option.$name : this.option.id ? this.$route.name + '_' + this.option.id : this.$route.name + '_option1'
      if (!name) return
      this.debounceLs(() => {
        let prop = params.column.property
        let width = params.cell.offsetWidth
        let financeTablesInfoStr = window.localStorage.getItem('financeTablesInfoStr')
        let financeTablesInfo = {}
        if (financeTablesInfoStr) {
          financeTablesInfo = JSON.parse(financeTablesInfoStr)
          let arr = financeTablesInfo[name]
          arr = arr ? arr : []
          let f = arr.find(item => {
            return item.prop === prop
          })
          if (f) {
            f.width = width
          } else {
            arr.push({ prop, width })
            financeTablesInfo[name] = arr
          }
        } else {
          let arr = [{ prop, width }]
          financeTablesInfo[name] = arr
        }
        financeTablesInfoStr = JSON.stringify(financeTablesInfo)
        window.localStorage.setItem('financeTablesInfoStr', financeTablesInfoStr)
      })
    },
    scrollEvent({ scrollLeft, scrollTop }) {
      this.debounceLs(() => {
        this.scrollLeft = scrollLeft
        this.scrollTop = scrollTop
      }, 200)
    },
    handleSizeChange(val) {
      let total = this.option.pagination.totalCount || 0
      let curr = this.option.pagination.currPage
      if(total - (curr - 1) * val <= 0){
        this.option.pagination.pageSize = val
        this.option.pagination.callback('CurrentChange', 1, this.option)
        return
      }
      this.option.pagination.callback('SizeChange', val, this.option)
    },
    handleCurrentChange(val) {
      this.option.pagination.callback('CurrentChange', val, this.option)
    },
    setBlur(row, item) {
      document.activeElement.blur()
      let propCode = item.prop.replace('Name', 'Code')
      let propEnName = item.prop.replace('Name', 'EnName')
      if (row.hasOwnProperty(propCode)) {
        row[propCode] = ''
      }
      if (row.hasOwnProperty(propEnName)) {
        row[propEnName] = ''
      }
    },
    handleScroll(x, y) {
      if ((x || x === 0) && (y || y === 0)) {
        this.$refs.xTable1 && this.$refs.xTable1.scrollTo(x, y)
      } else {
        setTimeout(() => {
          this.$refs.xTable1 && this.$refs.xTable1.scrollTo(this.scrollLeft, this.scrollTop)
        }, 50)
      }
    },
    // 手动选择行 凭证设置-核算维度---未使用
    setCurrentRow(row) {
      this.$refs.tableLayout_finance.toggleRowSelection(row, true)
    },
    sumMethod({ columns, data }) {
      return this.$attrs.sumMethod({ columns, data })
    },
    // 上传前钩子获取file名
    getFile(file, row) {
      row.file = file
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
      }
      return sizeLimit
    },
    handleChangeFile(file, fileList, row) {
      // row.fileList = fileList
      // console.log(row)
      // this.fileList = []
      // this.fileList.push(file)
    },
    handleRemove(file, fileList, row) {
      console.log(file, fileList)
      row.fileId = row.fileNo = ''
      this.showUploadBtn = true
    },
    // beforeRemove(file, fileList) {
    //   return this.$confirm(`确定移除 ${file.name}？`)
    // },
    handleExceed(files, fileList) {
      this.$message.warning(`只能选择 1 个文件！`)
    },
    handleImport(row) {
      // this.handleProgress()
      // 根据后台需求数据格式
      const form = new FormData()
      // 文件对象
      form.append('file', row.file)

      this.$store
        .dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form,
        })
        .then((res) => {
          if (res.data.code === 0) {
            if (res.data.data) {
              // this.resFileList.push(res.data.data)
              // row.fileId = res.data.data.fileNo
              row.fileNo = res.data.data.fileNo
              row.fileName = res.data.data.name
              row.fileId = res.data.data.oid
            }
            this.$message({
              type: 'success',
              message: '上传成功',
              duration: 1000,
            })
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg,
              duration: 1000,
            })
            // row.fileList = []
            // console.log(row)
            let elIconClose = this.financeTableUpload.getElementsByClassName('el-icon-close')[0]
            elIconClose.style.display = 'block'
            elIconClose.click()
          }
        })
    },
    uploadHttpRequest(param, api) {
      let formData = new FormData()
      formData.append('file', param.file)
      api(formData).then((res) => {
        param.onSuccess(res)
      })
    },
    uploadSuccess(response, file, fileList) {
      console.log(response)
      this.showUploadBtn = false
    },
    debounceLs(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
    showTooltipMethod ({ type, column, row, items, _columnIndex }) {
      let {params} = column
      if(params && params.hasTag && params.prop === 'name'){
        return row && row[params.prop]
      }
    },
  },
  activated() {
    // console.log('this.$route.meta.isUseCache', this.$route.meta.isUseCache)
    // if (this.$route.meta.isUseCache) {
    if (this.$refs.xTable1) {
      this.handleScroll()
    }
    this.__proto__.__proto__.__table__ = this
    // actived时右侧列错位
    let fTableO = document.querySelector('#' + (this.option.id ? this.option.id : 'option1'))
    let fRightO = fTableO && fTableO.querySelector('.vxe-table--render-default .vxe-table--body-wrapper.fixed-right--wrapper')
    if (fRightO) {
      fRightO.style.right = '1px'
      this.$nextTick(() => {
        fRightO.style.right = 0
      })
    }
    // }
  },
  components: {
    Tips,
    ListAmtSummary,
    FinanceColumn,
    Pagination
  },
  watch: {
    'option.columns': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.showXTable = false
          this.$nextTick(() => {
            this.showXTable = true
          })
        }
      }
    },
    'option.data': {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) { // 如果重新赋值，去掉勾选
          //初始化 diyTimeStamp值，便于排序时减法运算
          newVal.forEach(v=>v.diyTimeStamp = 0)
          this.handleMulti([])
          this.$refs.xTable1 && this.$refs.xTable1.clearCheckboxRow()
        }
      }
    },
  }
}
</script>
<style scoped lang="scss">

.el-button {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.table-popover {
  padding: 10px 8px;
  button {
    margin: 0;
    padding: 0;
    font-size: 12px;
    width: 60%;
    text-align: left;
    transition: transform 0.3s;
  }
  button:hover {
    transform: scale(1.1);
  }
}
.finance-table {
  padding: 8px;
  background: #fff;
  position: relative;
  ::v-deep.cell.el-tooltip {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ::v-deep{
    .forceHeight > div {
      height: 18px;
      padding-top: 0;
    }
    .colgroup_diy_supplier{
      background-color: #F3F5FF;
    }
    .colgroup_diy_system{
      background-color: #FFF6ED;
    }
    .el-date-editor.el-input.el-input--prefix .el-input__inner{
      padding-left: 22px;
    }
  }
}
.finance-el-pagination {
  padding: 10px 0 10px;
  overflow: hidden;
  background: #fff;
  position: relative;
}
.finance-el-pagination .pagination-container {
  float: right;
  ::v-deep {
    .el-pagination {
      padding-right: 0;
      .el-pagination__sizes {
        margin-right: 0;
        .el-select .el-input {
          margin-right: 0;
        }
      }
    }
  }
}
.finance-tips-container {
  position: absolute;
  left: 0;
  bottom: -18px; // -14px;
  height: 14px;
  width: 200px;
  .tips-abs{
    top: 0px; // 5px;
    ::v-deep.tips-container {
      padding-left: 0;
    }
  }
}
/* 多选选中样式 */
.finance-table ::v-deep .select-row-class td {
  background-color: #e8f4ff !important;
}
.finance-table ::v-deep .delete-row-class {
  text-decoration: line-through;
}
.finance-table .fin-table-type-button + .fin-table-type-button {
  margin-left: 6px;
}
</style>
<style lang="scss">
.finance-table .vxe-table--render-default {
  color: #4a4a4a;
}
.finance-table .vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--icon:before {
  border: 1px solid #dcdfe6;
}
.finance-table .ls-vxe-th {
  background-color: #F8F9FD;
  text-align: center;
  color: #909399 !important;
}
.finance-table .ls-vxe-th .vxe-cell--title {
  display: inline-block;
}
.finance-table .ls-vxe-th.fin-required .vxe-cell--title::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.finance-table .vxe-table--render-default th {
  padding: 3px 0 !important;
  height: 30px !important;
}
.finance-table .vxe-table--render-default th .vxe-cell {
  justify-content: center;
}
.finance-table .vxe-table--render-default tr td {
  text-align: center;
  padding-top: 3px;
  padding-bottom: 3px;
  color: #4a4a4a;
  height: 26px !important;
}
.finance-table .vxe-table--render-default tr .vxe-cell {
  padding-left: 5px;
  padding-right: 3px;
  line-height: 18px;
}
/* 当元素是input时，设置height 20px，否则会渲染成21px */
.finance-table .vxe-table--render-default tr .vxe-cell .el-input {
  height: 20px;
}
.finance-table .vxe-header--column .vxe-resizable:before {
  width: 1px;
  height: 100%;
  background-color: #dfe6ec;
}
.finance-table .vxe-header--column.col--fixed .vxe-resizable {
  right: -6px;
}
.finance-table .vxe-header--column .vxe-resizable:after, .vxe-header--column .vxe-resizable:before {
  content: "";
  display: inline-block;
  vertical-align: middle;
}
.vxe-table--tooltip-wrapper {
  z-index: 3000 !important;
}
.vxe-table--render-default .vxe-table--empty-content {
  color: #909399;
}
.vxe-table--tooltip-wrapper .vxe-table--tooltip-content {
  word-break: break-all;
}

.finance-table .el-table td .cell div {
  line-height: 14px;
}
.finance-table .finance-table-datepicker .el-input__inner {
  padding: 0 15px 0 18px;
}
.finance-table .el-date-editor.el-input {
  width: auto;
}

.finance-table .finance-table-upload .el-button {
  padding: 7px 10px;
}
.finance-table .underline{
  text-decoration: underline;
  cursor: pointer;
}
.finance-table .underline.no__line{
  text-decoration: none;
  cursor: none;
}
.finance-column-tip {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  /* word-break: break-all; */
}
.finance-column-tip-btns .el-button + .el-button {
  margin-left: 0;
}
/* td内多button，美化样式 */
.no-margin {
  margin: 0 !important;
}
.no-margin.scale-big {
  width: 100%;
}
.orderNoBtn > span,
.orderNoBtn > span > button,
.orderNoBtn > button {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.orderNoBtns > button:hover {
  transform: scale(1.05);
}
.no-margin.scale-big:hover {
  transform: scale(1.05);
}
.finance-table .el-link {
  font-size: 12px;
}
.finance-table .td_has_tag>div{
  text-align: left;
}
.finance-table .td_has_tag .td_tag_div{
  display: inline-block;
  min-width: 22px;
  text-align: left;
}
.finance-table .finance-self-tag {
  display: inline-block;
  min-width: 18px;
  height: 18px;
  margin-right: 2px;
  line-height: 18px;
  border-radius: 3px;
  padding: 0 2px;
  text-align: center;
  border: none;
  color: white;
  font-size: 12px;
  transform: scale(0.9);
}
.finance-table .finance-self-tag + .finance-self-tag {
  margin-left: 4px;
}
.finance-table .finance-self-tag.change { // .finance-table .finance-table-row-changed .finance-self-tag
  background-color: #ef8519;
}
// 甩字
.finance-table .finance-self-tag.drop { // .finance-table .finance-table-row-changed .finance-self-tag
  background-color: #edbf1a;
}
.finance-table .finance-self-tag.tag-pass {
  background-color: #33B18A;
}
.finance-table .finance-self-tag.refuse { // .finance-table .finance-table-row-refused .finance-self-tag.refuse
  background-color: #cd4130;
}
.finance-table .finance-self-tag.invalid { // .finance-table .finance-table-row-invalid .finance-self-tag
  background-color: #b3b3b3;
}
.finance-table .finance-self-tag.bluetag { // .finance-table .finance-table-row-invalid .finance-self-tag
  background-color: #409EFF;
}
// .finance-table .finance-self-tag { // .finance-table .finance-table-row-refused .finance-self-tag
//   background-color: #ef8519;
// }
.finance-table .finance-table-row-changed {
  background-color: #fdf2e8 !important;
}
.finance-table .finance-table-row-changed-fee {
  background-color: #EAF1E8;
}
.finance-table .finance-table-row-passed {
  background-color: rgb(240, 249, 235);
}
.finance-table .finance-table-row-refused {
  background-color: #fff0f1;
}
.finance-table .finance-table-row-invalid {
  background-color: #e9e8eb;
}
.finance-table .finance-table-row-warning {
  background-color: rgb(250, 236, 216); // rgb(253, 226, 226) // 此为浅红, 可用于danger
}
.finance-table-row-redmark td {
  color: #ff4949;
}
/* #B3B3B3  失效图标背景*/
/* #EF8519  改字图标背景*/
/* color: #cd4130;  拒字图标背景*/

// 用于类似输入框后面带%
.finance-table .finance-cell-suffix-cont {
  .el-input {
    width: calc(100% - 18px);
  }
}
.finance-table .finance-cell-suffix {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  color: #4a4a4a;
  font-size: 12px;
}
.finance-table-select {
  .el-input__inner {
    height: 20px !important;
  }
  .el-select__input {
    height: 20px;
  }
  .el-select {
    width: 100%;
  }
}
/* 用于element计算右侧列高度不准确的情况 */
.finance-table .el-table__fixed-right {
  min-height: 70px !important;
}
.finance-table .finance-table-row-invisible {
  display: none !important;
}
.finance-table .operationbtns-wrapper + .operationbtns-wrapper {
  margin-left: 6px;
}
.finance-table .operationbtns-wrapper .el-button {
  font-size: 12px;
  color: #1890ff;
  padding: 0 2px;
  border: none;
  line-height: 20px;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.el-icon.el-icon-arrow-right {
  /* width: 20px;
  height: 20px; */
  cursor: pointer;
  margin-right: 6px;
  transition: transform 0.2s ease-in-out;
}
.finance-table .el-icon.el-icon-arrow-right.active {
  transform: rotate(90deg);
}
.app-wrapper .finance-table .finance-table-remark-textarea textarea {
  min-height: 100px !important;
}
.finance-table .finance-icon-custom-columns {
  font-size: 14px;
  cursor: pointer;
}

.vxe-table--render-default.border--inner .col--group {
  border-right: 1px solid #dfe6ec !important;
}
</style>
