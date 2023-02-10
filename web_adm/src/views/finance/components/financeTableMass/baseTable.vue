<template>
  <div class="finance-table">
    <div class="finance-el-table" :style="option.style || {}">
      <vxe-table
        align="center"
        ref="xTable1"
        resizable
        :data="option.data"
        :empty-text="option.emptyText || '暂无数据'"
        show-header-overflow
        show-overflow
        highlight-hover-row
        :header-cell-class-name="headerCellClassName"
        :row-class-name="rowClassNameFunc"
        :cell-class-name="cellClassNameFunc"
        size="mini"
        border="inner"
        :max-height="option.maxHeight || 500"
        :scroll-y="{gt:40}"
        @selection-change="handleMulti"
        @checkbox-all="selectAllEvent"
        @checkbox-change="selectChangeEvent"
        @cell-click="cellClickEvent"
        @resizable-change="resizableChange"
        @scroll="scrollEvent"
        row-id
      >
        <vxe-column type="seq" width="55" v-if="option.showIndex"></vxe-column>
        <vxe-column type="checkbox" width="55" v-if="option.selection" fixed="left"> </vxe-column>
        <vxe-column
          v-for="(item, index) in option.columns"
          :key="item.prop"
          :title="item.label"
          :field="item.prop"
          :min-width="item.minWidth || 76"
          :formatter="item.formatter"
        >
          <template #default="{ row, rowIndex }" v-if="item.propInDict">
            {{ dictMapObj[item.propInDict][row[item.prop]] }}
          </template>
        </vxe-column>
        <vxe-column
          v-if="option.operationBtns"
          :title="option.operationBtns.title || '操作'"
          :width="option.operationBtns.width"
          :fixed="option.operationBtns.fixed || 'right'"
          :resizable="
            option.operationBtns && option.operationBtns.resizable === true ? true : false
          "
        >
          <template #default="{ row, rowIndex }">
            <template v-for="(item, index) in option.operationBtns.data">
              <span :key="'operationBtns' + index" class="operationbtns-wrapper">
                <el-button
                  type="text"
                  :style="
                    item.style || {
                      color:
                        item.colorType === 'edit'
                          ? '#EDB534'
                          : item.colorType === 'cancel'
                          ? '#cd4130'
                          : item.colorType === 'pass'
                          ? '#33B18A'
                          : '#1890ff',
                    }
                  "
                  @click.stop="option.operationBtns.callback(item.action, rowIndex, row, option)"
                  >{{ item.label }}</el-button
                >
              </span>
            </template>
          </template>
        </vxe-column>
        <template v-if="option.diyEmpty" #empty>
          <slot name="empty"></slot>
        </template>
      </vxe-table>
    </div>
    <div class="finance-el-pagination">
      <NewPagination
        v-if="option.pagination.isNew"
        :config="option.pagination"
        @size-change="handleSizeChangeNew"
        @current-change="handleCurrentChangeNew"
      />
      <el-pagination
        v-else
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
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NewPagination from './newPagination'
// import FinanceColumn from './financeColumn'
export default {
  name: 'Table',
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    NewPagination,
    // FinanceColumn,
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
  methods: {
    // 选择触发
    handleMulti(data) {
      this.$emit('send-multi', [...data], this.option)
    },
    handleSizeChange(val) {
      let total = this.option.pagination.totalCount || 0
      let curr = this.option.pagination.currPage
      if (total - (curr - 1) * val <= 0) {
        this.option.pagination.pageSize = val
        this.option.pagination.callback('CurrentChange', 1, this.option)
        return
      }
      this.option.pagination.callback('SizeChange', val, this.option)
    },
    handleCurrentChange(val) {
      console.log(val)
      this.option.pagination.callback('CurrentChange', val, this.option)
    },
    handleSizeChangeNew(val) {
      console.log(val)
      this.option.pagination.callback('SizeChange', val, this.option)
    },
    handleCurrentChangeNew(val) {
      this.option.pagination.callback('CurrentChange', val, this.option)
    },
    selectAllEvent({ checked, records }) {
      this.setIsRowChecked()
      // checked===false 表示取消全选，清空时间戳
      if (checked === false) {
        this.option.data.forEach((v) => (v.diyTimeStamp = 0))
      }
      // 遍历所选项，时间戳不为0表示已选并保持时间戳，为0则表示未选变已选，赋值时间戳
      records.forEach((v) => (v.diyTimeStamp = v.diyTimeStamp || +new Date()))
      this.handleMulti(records)
    },
    selectChangeEvent({ checked, records, row }) {
      this.setIsRowChecked()
      // row.$isRowCheck为true表示选中，添加时间戳，为false表示取消，时间戳设为0
      // 此行代码一定放到setIsRowChecked()后
      row.diyTimeStamp = row.$isRowCheck ? +new Date() : 0
      this.handleMulti(records)
    },
    setIsRowChecked() {
      // console.log('````````setIsRowChecked', checked);
      let records = this.$refs.xTable1.getCheckboxRecords()
      this.option.data.forEach((item) => {
        item.$isRowCheck = false
      })
      records.forEach((item) => {
        item.$isRowCheck = true
      })
    },
    cellClickEvent({ row, column, triggerCheckbox, rowIndex, columnIndex, $event }) {
      if (!!this.getSelected()) {
        return
      }
      let ELSELEDROPDWS = document.querySelectorAll('body > .el-select-dropdown')
      for (let i = 0; i < ELSELEDROPDWS.length; i++) {
        if (ELSELEDROPDWS[i] && ELSELEDROPDWS[i].style.display !== 'none') return
      }
      if (this.option.handleCellClick) {
        this.option.handleCellClick({ row, column, triggerCheckbox, rowIndex, columnIndex, $event })
        return
      }
      // triggerCheckbox表示是否是checkbox触发
      if (!triggerCheckbox && this.option.noClickCheck !== true) {
        if (this.option.edit && this.option.noCheckWhenEdit) {
          // 在业务费用、专项管理费、费用单详情等页面，当处于编辑状态时，使点击勾选的功能不生效
        } else {
          this.$refs.xTable1.toggleCheckboxRow(row)
          // let records = this.$refs.xTable1.getCheckboxRecords()
          this.setIsRowChecked()
        }
        this.option.data.forEach((item) => {
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
    resizableChange(params) {
      // console.log(params)
      console.log(this.option.$name)
      let name = this.option.$name
        ? this.option.$name
        : this.option.id
        ? this.$route.name + '_' + this.option.id
        : this.$route.name + '_option1'
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
          let f = arr.find((item) => {
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
    getSelected() {
      if (window.getSelection) {
        return window.getSelection().toString()
      }
    },
    setIsRowChecked() {
      // console.log('````````setIsRowChecked', checked);
      let records = this.$refs.xTable1.getCheckboxRecords()
      this.option.data.forEach((item) => {
        item.$isRowCheck = false
      })
      records.forEach((item) => {
        item.$isRowCheck = true
      })
    },
    setCheckRow(row, isChecked) {
      this.$refs.xTable1.setCheckboxRow(row, isChecked)
      this.debounceLs(() => {
        this.setIsRowChecked()
        let records = this.$refs.xTable1.getCheckboxRecords()
        // row.$isRowCheck为true表示选中，添加时间戳，为false表示取消，时间戳设为0
        row.diyTimeStamp = row.$isRowCheck ? +new Date() : 0
        this.handleMulti(records)
      }, 10)
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
    // 单元格样式
    cellClassNameFunc({ row, rowIndex, column, columnIndex }) {
      let { params } = column
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
      if(params && params.prop) {
        let propCode = params.prop && params.prop.replace('Name', 'Code')
        // blId必填非必填都存在，特殊处理
        if ((params.required || row[params.prop + '_required']) && (!row[params.prop] || (row.hasOwnProperty(propCode) && !row[propCode]) || (typeof row[params.prop] === 'object' && !row[params.prop].length)) && this.option.showIsError) {
          return 'fin-td-is-error'
        }
      }
    },
  },
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
  ::v-deep {
    .colgroup_diy_supplier {
      background-color: #f3f5ff;
    }
    .colgroup_diy_system {
      background-color: #fff6ed;
    }
    .colgroup_diy_express {
      background-color: #b9ccee;
    }
    .colgroup_diy_express_system {
      background-color: #badab0;
    }
    .el-date-editor.el-input.el-input--prefix .el-input__inner {
      padding-left: 22px;
    }
  }
}
.finance-el-pagination {
  padding: 10px 0 10px;
  overflow: hidden;
  background: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  .tips-abs {
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
  background-color: #f8f9fd;
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
.finance-table .ls-vxe-th .vxe-cell > span:not(:last-of-type) {
  margin-left: 3px;
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
.finance-table .vxe-header--column {
  user-select: auto;
}
.finance-table .vxe-header--column .vxe-resizable:before {
  width: 1px;
  height: 100%;
  background-color: #dfe6ec;
}
.finance-table .vxe-header--column.col--fixed .vxe-resizable {
  right: -6px; // 此处勿修改，如需修改，针对性修改其他地方
}
.finance-table .vxe-header--column .vxe-resizable:after,
.vxe-header--column .vxe-resizable:before {
  content: '';
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
.finance-table .underline {
  text-decoration: underline;
  cursor: pointer;
}
.finance-table .underline.no__line {
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
.finance-table .td_has_tag > div {
  text-align: left;
}
.finance-table .td_has_tag .td_tag_div {
  display: inline-block;
  min-width: 22px;
  text-align: left;
}
.finance-table .fin-td-is-error .el-input__inner {
  border-color: #ff4949;
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
// 改字
.finance-table .finance-self-tag.change {
  // .finance-table .finance-table-row-changed .finance-self-tag
  background-color: #ef8519;
}
// 甩字
.finance-table .finance-self-tag.drop {
  // .finance-table .finance-table-row-changed .finance-self-tag
  background-color: #edbf1a;
}
.finance-table .finance-self-tag.tag-pass {
  background-color: #33b18a;
}
.finance-table .ls_green {
  color: #33b18a;
}
.finance-table .finance-self-tag.refuse {
  // .finance-table .finance-table-row-refused .finance-self-tag.refuse
  background-color: #cd4130;
}
.finance-table .finance-self-tag.delay {
  // .finance-table .finance-table-row-refused .finance-self-tag.refuse
  background-color: #ffaf21;
}
.finance-table .finance-self-tag.delaysmall {
  // .finance-table .finance-table-row-refused .finance-self-tag.refuse
  background-color: #cd4130;
}
.finance-table .finance-self-tag.invalid {
  // .finance-table .finance-table-row-invalid .finance-self-tag
  background-color: #b3b3b3;
}
.finance-table .finance-self-tag.bluetag {
  // .finance-table .finance-table-row-invalid .finance-self-tag
  background-color: #409eff;
}
// .finance-table .finance-self-tag { // .finance-table .finance-table-row-refused .finance-self-tag
//   background-color: #ef8519;
// }
.finance-table .finance-table-row-changed {
  background-color: #fdf2e8 !important;
}
.finance-table .finance-table-row-changed-fee {
  background-color: #eaf1e8;
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
