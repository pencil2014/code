<template>
	<div class="table-cont">
		<Tips :tips="config.tips" :callback="handleSelectionClear" />
		<el-table
			fit
			border
			ref="tableLayout"
			style="width: 100%"
			:max-height="tableHeight"
			:data="config.list"
			@row-click="handleClickRow"
			@selection-change="handleSelectionChange"
			@sort-change="handleSortChange"
			:row-class-name="tableRowClassName"
			:show-summary="(config.summary && config.summary.showSummary) || false"
			:summary-method="config.summary && config.summary.summaryMethod"
			:row-key="config.options && config.options.rowKeyId"
			:tree-props="config.options && config.options.treeProps"
			:span-method="config.objectSpanMethod"
			@cell-mouse-enter="showTooltip"
			@cell-mouse-leave="hiddenTooltip"
			@header-dragend="changeColumnWidth"
			:lazy="config.options.lazy"
			:load="config.options.load"
			:stripe="!!config.stripe"
			@select-all="selectAllFn"
			@select="selectFn"
		>
			<!-- 选中 -->
			<slot name="MutiSelectSlot"></slot>
      <el-table-column v-if="config.customColumns && config.customColumns.show" :width="36" :fixed="'left'" :resizable="true">
				<template #header>
					<el-tooltip :content="'自定义表头'" placement="top">
						<i class="el-icon-setting icon-custom-columns" @click="config.customColumns && config.customColumns.handleCustomColumns()"></i>
					</el-tooltip>
				</template>
			</el-table-column>
			<!-- 索引 -->
			<el-table-column v-if="isShowTabelIndex && config.list && config.list.length" type="index" label="编号" align="center" width="40"> </el-table-column>

			<!-- 标题-->
			<el-table-column
				v-for="(item, index) in config.columns"
				:fixed="item.fixed"
				:sortable="item.sortable"
				:prop="item.prop"
				:align="item.align || 'left'"
				:header-align="item['header-align'] || 'left'"
				:label="item.label"
				:width="item.width"
				:min-width="item.minWidth || 80"
				:key="item.prop + index"
			>
				<!-- 自定义表头插槽{component}-->
				<template slot="header">
					<span v-if="item.component">
						<component :is="item.component" :param="item"> </component>
					</span>
					<span v-else>{{ item.label }}</span>
				</template>

				<!-- 列表-->
				<template slot-scope="scope">
					<!-- 锁定状态下 -->
					<template v-if="config.options.lockState">
						<span v-if="item.popoverComponent">
							<component :is="item.popoverComponent" :item="item" :param="scope.row" :scope="scope"> </component>
						</span>
						<div class="column-text" v-else v-html="column(scope, item)" @click.stop="handleColumn(scope, item)"></div>
					</template>
					<!-- 解锁表格可编辑 -->
					<div v-if="!config.options.lockState" :class="item.unit ? 'unit' : ''">
						<span v-if="item.popoverComponent && item.type === 'text'">
							<component :is="item.popoverComponent" :item="item" :param="scope.row" :scope="scope"> </component>
						</span>
						<div class="column-text-btn" v-else-if="item.type === 'text'" v-html="column(scope, item)" @click.stop="handleColumn(scope, item)"></div>
						<!-- 输入框自动提醒 -->
						<el-autocomplete
							size="mini"
							v-if="item.type === 'autocomplete'"
							class="inline-input"
							v-model="scope.row[item.prop]"
							:type="item.type"
							:style="item.style || defaultStyle"
							:disabled="item.disabled"
							trigger-on-focus
							:fetch-suggestions="
								(queryString, cb) => {
									item.querySearch && item.querySearch(queryString, cb, scope.row)
								}
							"
							:placeholder="item.placeholder || '请输入' + item.label"
							@change="
								value => {
									item.change && item.change(value, scope.row)
								}
							"
							@select="
								value => {
									item.select && item.select(value, scope.row)
								}
							"
						></el-autocomplete>
						<!-- 远程搜索 -->
						<el-select
							size="mini"
							v-if="item.type === 'remoteSelect'"
							:row-style="item.selectSetData && item.selectSetData(scope.row, scope.row.index, item)"
							v-model="scope.row[item.prop]"
							filterable
							remote
							clearable
							:reserve-keyword="item.reserveKeyword"
							:style="item.style || defaultStyle"
							:multiple="item.multiple"
							:disabled="item.disabled"
							:collapse-tags="item['collapse-tags']"
							:multiple-limit="item['multiple-limit']"
							:name="item.name"
							:popper-class="item['popper-class']"
							:placeholder="item.placeholder || '请选择' + item.label"
							:remote-method="
								value => {
									item.filterMehod && item.filterMehod(value, item)
								}
							"
							@visible-change="
								value => {
									item.visibleChange && item.visibleChange(value, scope.row, item)
								}
							"
							@change="
								value => {
									item.change && item.change(value, scope.row, item)
								}
							"
						>
							<div v-for="(item, index) in item.data || scope.row[item.prop + '__selectData']" :key="item.value + index">
								<el-option v-if="item.value" :label="item.label" :value="item.value"> </el-option>
							</div>
							
						</el-select>
						<!-- 输入框 -->
						<el-input
							size="mini"
							v-if="item.type === 'input'"
							class="inline-input"
							:clearable="item.clearable || true"
							:style="item.style || defaultStyle"
							:readonly="item.readonly || false"
							v-model="scope.row[item.prop]"
							:type="item.type"
							:maxlength="item.maxlength"
							:disabled="item.disabled||item.disableFunc&&item.disableFunc(scope.row)"
							:placeholder="item.placeholder || '请输入' + item.label"
							@change="
								value => {
									item.change && item.change(value, scope.row)
								}
							"
							@focus="item.focus && item.focus(scope.$index)"
							@blur="item.blur && item.blur(scope.$index)"
						></el-input>
						<!-- 日期和时间 -->
						<el-date-picker
							size="mini"
							v-if="item.type === 'date'"
							v-model="scope.row[item.prop + '__dateValue']"
							:type="item.category"
							:name="item.name"
							:style="item.style || defaultStyle"
							:readonly="item.readonly"
							:disabled="item.disabled"
							:editable="item.editable"
							:clearable="item.clearable"
							:range-separator="item['range-separator']"
							:start-placeholder="item['start-placeholder'] || '开始时间'"
							:end-placeholder="item['end-placeholder'] || '结束时间'"
							:placeholder="item.placeholder || '请选择' + item.label"
							:format="item.format"
							:align="item.align"
							:popper-class="item['popper-class']"
							:default-value="item['default-value']"
							:default-time="item['default-time']"
							:value-format="item.format"
							@change="
								value => {
									item.change && item.change(value, scope.row)
								}
							"
						/>

						<!-- 下拉选择框 -->
						<el-select
							size="mini"
							v-if="item.type === 'select'"
							v-model="scope.row[item.prop]"
							:style="item.style || defaultStyle"
							:multiple="item.multiple"
							:disabled="item.disabled"
							:clearable="item.clearable || true"
							:collapse-tags="item['collapse-tags']"
							:multiple-limit="item['multiple-limit']"
							:name="item.name"
							:filterable="item.filterable"
							:allow-create="item['allow-create']"
							:filter-method="
								value => {
									item.filterMehod && item.filterMehod(value, item)
								}
							"
							:popper-class="item['popper-class']"
							:placeholder="item.placeholder || '请选择' + item.label"
							@visible-change="
								value => {
									item.visibleChange && item.visibleChange(value, item)
								}
							"
							@change="
								value => {
									item.change && item.change(value, scope.row, scope.$index)
								}
							"
						>
							<el-option v-for="(o, key) in dictMap[item.prop] || item.data" :key="key" :label="item.nonDictionary ? o.label : $t(`dict.${item.prop}.${o.value}`)" :value="o.value"> </el-option>
						</el-select>

						<span v-if="item.unit">{{ item.unit }}</span>
					</div>
				</template>
			</el-table-column>

			<!-- 操作按钮组 -->
			<el-table-column 
				:resizable="false" 
				ref="fixedColumn" 
				align="left" 
				:label="config.operationBtns.title || '操作'" 
				v-if="config.operationBtns.show" 
				:min-width="config.operationBtns.minWidth || ''"
				:width="config.operationBtns.width || ''" 
				:fixed="config.operationBtns.fixed">
				<template slot-scope="scope">
					<TableOperationBtn :operationBtns="config.operationBtns" :scope="scope" />
				</template>
			</el-table-column>
		</el-table>
		<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
		<div class="table-footer" ref="tableFooter">
			<!-- 分页 -->
			<Pagination :config="config" :tableQuery="tableQuery" :callback="callback" />
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'

import { sleep } from '@/utils/tools'
import Tips from '../Tips/index'
import TableOperationBtn from './operationBtn'
import Pagination from './pagination'
import tableTooltip from './table-tooltip'
export default {
	name: 'Table',
	data() {
		return {
			defaultColumnWidth: '150',	// 表格列未设置宽度默认为150px
			tableHeight: 400,
			defaultStyle: {
				width: '100%'
			},
			isCheckedRows: [],
			tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null, // 行数据
			},
		}
	},
	props: {
		config: {
			type: Object,
			default: () => ({})
		},
		// 接口传参
		tableQuery: {
			type: Object,
			default: () => ({})
		},
		callback: {
			type: Function,
			default: () => ({})
		}
	},
	created() {
		this.init()
	},
	mounted() {
		// DOM加载完成后计算表格高度
		this.$nextTick(() => {
			this.dynamicHeight()
		})
	},
	updated() {},
	components: {
		TableOperationBtn,
		Tips,
		Pagination,
		tableTooltip
	},
	computed: {
		// 是否显示编号(索引)
		isShowTabelIndex() {
			let { tableIndex = {} } = this.config
			return !tableIndex.show ? false : true
		},
		...mapGetters(['dictMap'])
	},
	watch: {},
	methods: {
		selectAllFn(selection){
			if(this.config.options.selectAll){
				return this.config.options.selectAll(selection)
			}else{
				return
			}
		},
		selectFn(selection, row){
			if(this.config.options.selectAll){
				return this.config.options.selectFn(selection, row)
			}else{
				return
			}
		},
		// 自定义列宽保存
		changeColumnWidth(newWidth, oldWidth, column, event) {
			console.log(column.minWidth)
			const tableWidth = parseInt(document.querySelector('.table-cont .el-table').offsetWidth)
			// 设置最大拖动距离为table宽的0.6倍,最小拖动距离为minWidth
			let maxWidth = parseInt(0.6*tableWidth)
			if (newWidth > maxWidth) {
				column.width = maxWidth
			} else {
				column.width = newWidth
			}
			// if (newWidth < column.minWidth) {
			// 	column.width = column.minWidth
			// } 
			
			this.callback('SaveColumnWidth', {width: column.width, prop: column.property})
			// 拖动后重绘表格解决表头固定列错位
			this.$refs.tableLayout.doLayout()
			console.log('newWidth, oldWidth, column, event', newWidth, oldWidth, column.width, column, event)
		},
		// 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell;
      this.tableCellMouse.row = row;
      this.tableCellMouse.hidden = false;
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true;
    },
		init() {},
		async dynamicHeight(value) {
			let { style = {} } = this.config
			let { height } = style
			await sleep(200)

			if (height) {
				return (this.tableHeight = height)
			}

			let { tableLayout, tableFooter } = this.$refs
			height = document.documentElement.clientHeight || document.body.offsetHeight

			let table = tableLayout.$el.getBoundingClientRect()
			let footer = tableFooter.getBoundingClientRect()
			this.tableHeight = height - table.top - footer.height - 20 // 表格高度=文档高度-表格距顶部距离-表格分页-容器padding间距
		},

		column({ $index, row }, item) {
			let { prop, formatter, method } = item
			if (formatter) {
				return formatter(row, item)
			}
			if (method) {
				return method($index, row, item)
			}
			return row[prop]
		},

		// 执行回调
		handleColumn({ $index, row }, item) {
			let { method } = item
			if (method) {
				method($index, row, item)
			}
		},
		// 点击选中,取消行
		handleClickRow(row, column, event) {
			// config必须配置mutiSelect属性才能生效
			if (!this.config.options.mutiSelect) return
			// 如果禁用复选框则点击行取消选中效果
			if (row.checkable===false) return
			this.$refs.tableLayout.toggleRowSelection(row)
		},
		// 多行选中
		handleSelectionChange(arr) {
			if(this.config.options.mutiSelectOnlyOne){
				// 只能选择一个
				let oldSelectArr = this.isCheckedRows
				this.isCheckedRows = arr
				if (this.isCheckedRows.length > 1) {
					if (oldSelectArr.length === 1) {
						let del_row = this.isCheckedRows.shift()
						this.$refs.tableLayout.toggleRowSelection(del_row, false)
					} else {
						this.$message({
							message: '当前操作只能选择一条数据',
							type: 'warning'
						});
						this.handleSelectionClear(arr);
					}
				}
				this.callback('Muti', arr)
			}else{
				this.isCheckedRows = arr
				this.callback('Muti', arr)
			}
		},

		// 排序
		handleSortChange(column, prop, order) {
			// console.log(column, prop, order);
			let ascColumns = []
			let descColumns = []

			if (column.order === 'ascending') {
				ascColumns.push(column.prop)
			}
			if (column.order === 'descending') {
				descColumns.push(column.prop)
			}

			Object.assign(this.tableQuery, {
				ascColumns: ascColumns,
				descColumns: descColumns
			})

			// this.tableQuery.ascColumns = Array.from(new Set(this.tableQuery.ascColumns))
			// this.tableQuery.descColumns = Array.from(new Set(this.tableQuery.descColumns))

			this.callback('Sort', this.tableQuery)
		},

		// 取消多选
		handleSelectionClear(action) {
			this.$refs.tableLayout.clearSelection()
			// this.callback(action)
		},

		// 单条数据修改
		handleEditSingle(row, value) {
			if (!value) {
				return this.$message.warning('请填写')
			}
			// this.callback('SingleEdit', row)
		},

		// 为table的行row设置一个className
		tableRowClassName({ row, rowIndex }) {
			// console.log(this.isCheckedRows, rowIndex)
			let self = this
			// 推荐位
			if (row.isRecommendRow) {
				return 'success-row'
			}
			for (let i = 0; i < self.isCheckedRows.length; i++) {
				if (row === self.isCheckedRows[i]) {
					return 'isChecked-row'
				}
			}
			// // 订单列表已取消，已关闭
			// if (row.orderIsCancel || row.orderIsClose) {
			// 	return 'cancel-row'
			// }
			// // 订单列表已完成
			// if (row.orderIsFinish) {
			// 	return 'finish-row'
			// }
			// so列表未绑定
			if (row.soIsUnBind) {
				return 'unBind-row'
			}
			// so列表已取消
			if (row.soIsCancel) {
				return 'cancel-row'
			}
			return ''
		},
		// 表格默认选中
		toggleRowSelection() {
			this.$nextTick(function() {
				let defaultSelects = this.config.list.filter(item => item.selected == 'Y')
				if (defaultSelects.length > 0) {
					defaultSelects.forEach(row => {
						this.$refs.tableLayout.toggleRowSelection(row, true)
					})
				} else {
					this.$refs.tableLayout.clearSelection()
				}
			})
		}
	},
	watch: {
		'config.list'(newVal, oldVal) {
			if (newVal.length > 0) {
				this.toggleRowSelection()
			}
		}
	}
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
