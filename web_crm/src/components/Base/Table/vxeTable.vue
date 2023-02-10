<template>
	<div class="table-cont">
		<!-- <Tips :tips="config.tips" :callback="handleSelectionClear" /> -->
		<!-- vxe-table文档：https://xuliangzhan_admin.gitee.io/vxe-table/#/table/api -->
		<vxe-table
			ref="tableLayout"
			empty-text="未查询到任何数据"
			resizable
			highlight-hover-row
			:show-header-overflow="true"
			:show-overflow="true"
			:tooltip-config="{ contentMethod: showTooltipMethod, enterable: true }"
			align="left"
			header-align="left"
			size="mini"
			:border="config.border || 'inner'"
			style="width: 100%"
			:max-height="tableHeight"
			:data="config.list"
			:scroll-y="{ mode: 'wheel', enabled: config.options.scrollY ? (config.options.scrollY.enabled === false ? false : true) : true, gt: (config.options.scrollY && config.options.scrollY.gt) || 90 }"
			@cell-click="handleClickRow"
			@selection-change="handleSelectionChange"
			@sort-change="handleSortChange"
			:row-class-name="tableRowClassName"
			:show-footer="(config.summary && config.summary.showSummary) || false"
			:footer-method="config.summary && config.summary.summaryMethod"
			:row-key="config.options && config.options.rowKeyId ? true : false"
			:row-id="config.options.rowKeyId"
			:tree-config="
				config.options.treeProps && {
					transform: false,
					rowField: config.options.rowKeyId,
					parentField: 'parentId',
					children: config.options.treeProps.children,
					hasChild: config.options.treeProps.hasChildren,
					lazy: config.options.lazy,
					loadMethod: loadChildrenMethod,
					expandAll: config.options.treeProps.expandAll,
					iconOpen: 'el-icon-arrow-down',
					iconClose: 'el-icon-arrow-right',
					iconLoaded: 'el-icon-loading'
				}
			"
			:span-method="config.objectSpanMethod"
			@resizable-change="changeColumnWidth"
			:lazy="config.options.lazy"
			:loadMethod="config.options.load"
			:stripe="!!config.stripe || true"
			:checkbox-config="{ highlight: true, checkMethod: checkSelectable }"
			@checkbox-all="selectAllFn"
			@checkbox-change="selectChangeEvent"
			:sort-config="{ remote: true }"
		>
			<!-- 选中 -->
			<slot name="MutiSelectSlot"></slot>
			<!-- 自定义索引，使用在表格行合并后，索引值错误情况 -->
			<vxe-column v-if="config.customColumns && config.customColumns.show" type='customColumns' :width="36" :fixed="'left'" :resizable="true">
				<template #header>
					<el-tooltip :content="'自定义表头'" placement="top">
						<i class="el-icon-setting icon-custom-columns" @click="config.customColumns && config.customColumns.handleCustomColumns()"></i>
					</el-tooltip>
				</template>
			</vxe-column>
			<!-- 索引 -->
			<vxe-column v-if="isShowTabelIndex && config.isCustomIndex" type="seq" title="序号" align="left" width="46" :resizable="true" fixed="left">
				<template slot-scope="scope">
					{{scope.row.customIndex}}
				</template>
			</vxe-column>
			<vxe-column v-if="isShowTabelIndex && !config.isCustomIndex" type="seq" title="序号" align="left" width="46" :resizable="true" fixed="left">
			</vxe-column>

			<!-- 标题-->
			<vxe-column
				v-for="(item, index) in config.columns"
				:fixed="item.fixed ? 'left' : ''"
				:sortable="item.sortable === 'custom' ? true : false"
				:field="item.prop"
				:align="item.align || 'left'"
				:header-align="item['header-align'] || 'left'"
				:title="item.label"
				:width="item.width"
				:key="item.prop + index"
				:tree-node="index == 0 && !!config.options.treeProps"
				:resizable="true"
				:min-width="item.minWidthDrag ? item.minWidth : ''"
			>
				<template v-if="item.headerSign" #header>
					<span style="margin-right:4px;">{{item.label}}</span>
					<el-tooltip v-if="item.headerSign.text" :content="item.headerSign.text || ''" placement="top">
						<i class="icon-custom-columns" :class="item.headerSign.iconClass || 'el-icon-question'"></i>
					</el-tooltip>
					<el-tooltip v-if="item.headerSign.htmlText" placement="top">
						<div slot="content" v-html="item.headerSign.htmlText"></div>
						<i class="icon-custom-columns" :class="item.headerSign.iconClass || 'el-icon-question'"></i>
					</el-tooltip>
				</template>
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
							<component :is="item.popoverComponent" :item="item" :param="scope.row"> </component>
						</span>

						<span v-else v-html="column(scope, item)" @click.stop="handleColumn(scope, item)"></span>
					</template>
					<!-- 解锁表格可编辑 -->
					<div v-if="!config.options.lockState" :class="item.unit ? 'unit' : ''">
						<span v-if="item.popoverComponent && item.type === 'text'">
							<component :is="item.popoverComponent" :item="item" :param="scope.row"> </component>
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
									item.filterMehod && item.filterMehod(value, item, scope.row[item.prop])
								}
							"
							@visible-change="
								value => {
									item.visibleChange && item.visibleChange(value, scope.row, item, scope.row[item.prop])
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
							:disabled="item.disabled || (item.disableFunc && item.disableFunc(scope.row))"
							:placeholder="item.placeholder || '请输入' + item.label"
							@change="
								value => {
									item.change && item.change(value, scope.row)
								}
							"
							@focus="item.focus && item.focus(scope.$rowIndex)"
							@blur="item.blur && item.blur(scope.$rowIndex)"
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
									item.change && item.change(value, scope.row, scope.$rowIndex)
								}
							"
						>
							<el-option v-for="(o, key) in dictMap[item.prop] || item.data" :key="key" :label="item.nonDictionary ? o.label : $t(`dict.${item.prop}.${o.value}`)" :value="o.value"> </el-option>
						</el-select>

						<span v-if="item.unit">{{ item.unit }}</span>
					</div>
				</template>
			</vxe-column>

			<!-- 操作按钮组 -->
			<vxe-column
				:resizable="config.operationBtns.resizable || false"
				ref="fixedColumn"
				align="left"
				:title="config.operationBtns.title || '操作'"
				v-if="config.operationBtns.show"
				:min-width="config.operationBtns.minWidth || ''"
				:width="config.operationBtns.width || ''"
				:fixed="config.operationBtns.fixed ? 'right' : ''"
			>
				<template slot-scope="scope">
					<TableOperationBtn :operationBtns="config.operationBtns" :scope="scope" />
				</template>
			</vxe-column>
			<template v-if="config.defaultEmpty" #empty>
				<span>
					<p>数据将在查询后显示</p>
				</span>
			</template>
		</vxe-table>
		<div v-if="config.tips.text" class="vux-tabel-selected-num">{{config.tips.text}}<span style="margin-left: 20px" v-if="config.tips.totalTxt">{{config.tips.totalTxt+'T' || ''}}</span></div>
		<div class="table-footer" ref="tableFooter" v-if="config.pagination.show && !config.pagination.oldPagination">
			<!-- 分页  && $route.name==='AirTransportOrderList'-->
			<Pagination :config="config" :tableQuery="tableQuery" :callback="callback" />
		</div>
		<div class="table-footer" ref="tableFooter" v-else-if="config.pagination.show && config.pagination.oldPagination">
			<OldPagination :config="config" :tableQuery="tableQuery" :callback="callback" />
		</div>

	</div>
</template>

<script>
import { mapGetters } from 'vuex'

import { sleep } from '@/utils/tools'
import Tips from '../Tips/index'
import TableOperationBtn from './vxeOperationBtn'
import OldPagination from './pagination'
import Pagination from './newPagination'
export default {
	name: 'Table',
	data() {
		return {
			defaultColumnWidth: '150', // 表格列未设置宽度默认为150px
			tableHeight: 400,
			defaultStyle: {
				width: '100%'
			},
			isCheckedRows: []
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
	destroyed() {
		window.removeEventListener('resize', this.dynamicHeight)
	},
	mounted() {
		window.addEventListener('resize', this.dynamicHeight)
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
		OldPagination
	},
	computed: {
		// 是否显示编号(索引)
		isShowTabelIndex() {
			let { tableIndex = {} } = this.config
			return !tableIndex.show ? false : true
		},
		...mapGetters(['dictMap'])
	},
	// watch: {},
	methods: {
		loadChildrenMethod({ row }) {
			// 异步加载子节点
			return new Promise(resolve => {
				this.config.options.vxeTableLoadChildren(row, resolve)
				// console.log('this.config.list', this.config.list)
			})
		},
		// 复选框是否可选
		checkSelectable({ row }) {
			let { checkSelectable } = this.config.options
			if (checkSelectable) {
				return checkSelectable(row)
			}
			return true
		},
		// 全选
		selectAllFn({ checked, records }) {
			this.setIsRowChecked()
			this.handleSelectionChange(records)
			// if(this.config.options.selectAll){
			// 	return this.config.options.selectAll(records)
			// }else{
			// 	return this.handleSelectionChange(records)
			// }
		},
		// 单选
		selectFn({ checked, records, row }) {
			this.setIsRowChecked()
			this.handleSelectionChange(records)
			// if(this.config.options.selectFn){
			// 	// return this.config.options.selectFn(records, row)
			// }else{
			// 	return this.handleSelectionChange(records)
			// }
		},
		// 设置该行被选中
		setIsRowChecked() {
			let records = this.$refs.tableLayout.getCheckboxRecords()
			this.config.list.forEach(item => {
				item.$isRowCheck = false
			})
			records.forEach(item => {
				item.$isRowCheck = true
			})
		},
		// 自定义列宽保存
		changeColumnWidth(item) {
			// console.log(item)
			const tableWidth = parseInt(document.querySelector('.table-cont .vxe-table').offsetWidth)
			// console.log('tableWidth', tableWidth)
			// 设置最大拖动距离为table宽的0.6倍,最小拖动距离为minWidth
			let maxWidth = parseInt(0.6 * tableWidth)
			let newWidth = item.column.resizeWidth
			let width = ''
			if (newWidth > maxWidth) {
				width = maxWidth
			} else {
				width = newWidth
			}
			if (item.column.minWidth) {
				if (newWidth < item.column.minWidth) {
					width = item.column.minWidth
				}
			}

			// else if (newWidth < column.minWidth) {
			// 	column.width = column.minWidth
			// }

			this.callback('SaveColumnWidth', { width: width, prop: item.column.property })
			// 拖动后重绘表格解决表头固定列错位
			// this.$refs.tableLayout.doLayout()
			// console.log('newWidth, oldWidth, column, event', newWidth, oldWidth, column.width, column, event)
		},
		init() {},
		// 动态计算tbale高度
		async dynamicHeight(value) {
			let { style = {} } = this.config
			let { height } = style
			await sleep(500)

			if (height) {
				return (this.tableHeight = height)
			}

			let { tableLayout, tableFooter } = this.$refs
			height = document.documentElement.clientHeight || document.body.offsetHeight

			let table = tableLayout.$el.getBoundingClientRect()
			let footerHeight = 0
			if(this.config.pagination.show){
				footerHeight = tableFooter.getBoundingClientRect().height
			}
			if(this.config.pagination.isDzgTabel){
				footerHeight = 20
			}

			// let footer = tableFooter.getBoundingClientRect()
			// console.log('tableHeight', height, table.top, footer.height)
			this.tableHeight = height - table.top - footerHeight - 20 -8 // 表格高度=文档高度-表格距顶部距离-表格分页-容器padding间距
			// console.log('tableHeight', this.tableHeight)
		},
		// formatter
		column({ $rowIndex, row }, item) {
			let { prop, formatter, method } = item
			if (formatter) {
				return formatter(row, item)
			}
			if (method) {
				return method($rowIndex, row, item)
			}
			return row[prop]
		},

		// 执行回调
		handleColumn({ $rowIndex, row }, item) {
			let { method } = item
			if (method) {
				method($rowIndex, row, item)
			}
		},
		// 虚拟滚动需要重新设置overflow省略号，tooltip显示
		showTooltipMethod({ type, column, row, items, _columnIndex }) {
			// console.log('column', row);
			// let {params} = column
			// if(params && params.hasTag && params.prop === 'name'){
			//   return row && row[params.prop]
			// }
			return null
		},
		// 点击选中,取消行
		handleClickRow({ row, column, triggerCheckbox, triggerTreeNode, $event }) {
			if(this.config.uniqueProp){
				// 有合并行的表格,特殊处理
				if(!row.$isRowCheck && !triggerCheckbox){
					let arr=[]
					for(let i=0;i<this.config.list.length;i++){
						if(this.config.list[i][this.config.uniqueProp] === row[this.config.uniqueProp]){
							arr.push(this.config.list[i])
						}
					}
					this.$refs.tableLayout.setCheckboxRow(arr,true)
				}else if(row.$isRowCheck && !triggerCheckbox){
					let arr=[]
					for(let i=0;i<this.config.list.length;i++){
						if(this.config.list[i][this.config.uniqueProp] === row[this.config.uniqueProp]){
							arr.push(this.config.list[i])
						}
					}
					this.$refs.tableLayout.setCheckboxRow(arr,false)
				}
				this.setIsRowChecked()
				let records = this.$refs.tableLayout.getCheckboxRecords()
				this.handleMuti(records)
				return
			}
			
			// config必须配置mutiSelect属性才能生效
			if (!this.config.options.mutiSelect) return
			// 如果禁用复选框则点击行取消选中效果
			if (row.checkable === false) return
			// if (!triggerTreeNode && this.config.options.selectFn) {
			// 	return this.config.options.selectFn([row], row)
			// }
			// triggerCheckbox表示是否是checkbox触发
			if (!triggerCheckbox && !triggerTreeNode) {
				this.$refs.tableLayout.toggleCheckboxRow(row)
				this.setIsRowChecked()
				this.config.list.forEach(item => {
					item.$isRowClick = false
				})
				row.$isRowClick = true
				let records = this.$refs.tableLayout.getCheckboxRecords()
				this.handleMuti(records)
			}
		},
		// 多行选中
		handleSelectionChange(arr) {
			// console.log('selection', arr)
			if (this.config.options.mutiSelectOnlyOne) {
				// 只能选择一个
				let oldSelectArr = this.isCheckedRows
				this.isCheckedRows = arr
				if (this.isCheckedRows.length > 1) {
					if (oldSelectArr.length === 1) {
						let del_row = this.isCheckedRows.shift()
						this.$refs.tableLayout.toggleCheckboxRow(del_row, false)
					} else {
						this.$message({
							message: '当前操作只能选择一条数据',
							type: 'warning'
						})
						this.handleSelectionClear(arr)
					}
				}
				this.handleMuti(arr)
			} else {
				this.handleMuti(arr)
			}
		},
		// checkbox选中事件
		selectChangeEvent({ checked, records, row }) {
			if(this.config.uniqueProp && checked){
				let arr=[]
				for(let i=0;i<this.config.list.length;i++){
					if(this.config.list[i][this.config.uniqueProp] === row[this.config.uniqueProp]){
						arr.push(this.config.list[i])
					}
				}
				this.$refs.tableLayout.setCheckboxRow(arr,true)
			}else if(this.config.uniqueProp && !checked){
				let arr=[]
				for(let i=0;i<this.config.list.length;i++){
					if(this.config.list[i][this.config.uniqueProp] === row[this.config.uniqueProp]){
						arr.push(this.config.list[i])
					}
				}
				this.$refs.tableLayout.setCheckboxRow(arr,false)
			}
			this.setIsRowChecked()
			this.handleSelectionChange(records)
		},
		// 排序
		handleSortChange(column, property, order) {
			// console.log(column, property, order);
			let ascColumns = []
			let descColumns = []

			if (column.order === 'asc') {
				ascColumns.push(column.property)
			}
			if (column.order === 'desc') {
				descColumns.push(column.property)
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
			this.$refs.tableLayout.clearCheckboxRow()
			this.handleMuti([])
			// this.callback(action)
		},
		handleMuti(data) {
			this.isCheckedRows = data
			this.callback('Muti', data)
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
			// console.log('this.isCheckedRows', this.isCheckedRows, row)
			if (row.parentId) {
				return 'el-table__row--level-1'
			}
      if (row._isInvalid) {
        return 'invalid-row'
      }
			// 推荐位
			if (row.isRecommendRow || row.recommend==='Y') {
				return 'success-row'
			}
			// 选中样式
			// if (row.$isRowCheck) {
			// 	return 'isChecked-row'
			// }
			if (this.isCheckedRows && this.isCheckedRows.indexOf(row) > -1) {
				return 'isChecked-row'
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
			// 订单列表已拒绝
			if (row.orderStatus === 'refuse') {
				return 'refuse-row'
			}
			if (this.config.rowColorShow && row.isWhiteCust === 'Y') {
				return 'success-row'
			}
			return ''
		},
		// 表格默认选中
		toggleCheckboxRow() {
			this.$nextTick(function() {
				let defaultSelects = this.config.list.filter(item => item.selected == 'Y')
				if (defaultSelects.length > 0) {
					defaultSelects.forEach(row => {
						this.$refs.tableLayout.toggleCheckboxRow(row, true)
					})
					this.handleMuti(defaultSelects)
				} else {
					this.handleMuti([])
					this.$refs.tableLayout.clearCheckboxRow()
				}
			})
		},
		// 表格展开所有子节点
		setAllTreeExpand() {
			this.$nextTick(() => {
				this.$refs.tableLayout.setAllTreeExpand(true)
			})
		}
	},
	watch: {
		'config.list': {
			handler(newVal, oldVal) {
				if (newVal) {
					this.toggleCheckboxRow()
          if (!this.config.options?.treeProps?.expandDefaultNot) {
            this.setAllTreeExpand()
          }
				}
			}
		}
	}
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
.vxe-table--render-default .vxe-body--row.row--checked {
    background-color: #E7EDF7 !important;
}
</style>
