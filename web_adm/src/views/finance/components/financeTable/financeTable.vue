<template>
	<div class="finance-table" :class="{ max__height__table: $attrs.autoMax }">
		<div class="finance-el-table" :style="option.style || {}">
			<!-- <Tips v-if="option.tips" :tips="option.tips" :callback="handleTableClearSelection" /> -->
			<!-- 添加多选样式，选中样式去掉 -->
			<!-- highlight-current-row -->
			<el-table
				fit
				ref="tableLayout_finance"
				style="width: 100%"
				v-loading="option.loading"
				:row-key="$attrs.rowKey"
				:data="option.data"
				:row-class-name="rowClassNameFunc"
				:max-height="$attrs.maxHeight || option.maxHeight"
				:show-summary="!!$attrs.showSummary"
				:summary-method="sumMethod"
				:span-method="option.spanMethod"
				:border="option.border === true || true"
				@selection-change="handleMuti"
				@sort-change="
					({ column, prop, order }) => {
						option.sortChange && option.sortChange(column, prop, order)
					}
				"
				@row-click="handleRowClick"
				@header-dragend="resizableChange"
			>
				<el-table-column type="selection" width="40px" align="center" :fixed="option.selection.fixed" v-if="option.selection && option.selection.show" :selectable="(row, index) => (row._disabled ? false : true)"></el-table-column>
				<el-table-column
					:label="option.index.title || '序号'"
					type="index"
					width="40px"
					align="center"
					v-if="option.index && option.index.show"
					:fixed="'left'"
					:resizable="option.index && option.index.resizable === true ? true : false"
				></el-table-column>
				<!-- 序号的resizable默认置为不可拖动，容易影响勾选框 -->
				<template v-for="(item, index) in columns">
					<el-table-column
						v-if="item.isTooltip"
						show-overflow-tooltip
						:key="item.prop + index"
						:label="item.label"
						:align="'center'"
						:header-align="'center'"
						:min-width="item.width || item.minWidth || 80"
						:width="item.width || ''"
						:prop="item.prop"
						:sortable="option.sortable && item.sortable !== false ? 'custom' : false"
						:fixed="index === 0 || (!!item.fixed && item.fixed)"
						:style="{ 'text-align': 'right' }"
						:formatter="(row, col, val) => (item.formatter ? item.formatter(row) : renderNoEdit(row, item))"
						:resizable="item.resizable === false ? false : true"
					></el-table-column>
					<el-table-column
						v-else
						:key="item.prop + index"
						:label="item.label"
						:align="'center'"
						:header-align="'center'"
						:min-width="item.width || item.minWidth || 80"
						:width="option.columns.length < 15 && parseInt(item.width) < 125 ? item.widthForce || '' : item.width || ''"
						:prop="item.prop"
						:sortable="option.sortable && item.sortable !== false ? 'custom' : false"
						:fixed="index === 0 || (!!item.fixed && item.fixed)"
						:style="{ 'text-align': 'right' }"
						:resizable="item.resizable === false ? false : true"
						:show-overflow-tooltip="item.type !== 'button' && (option.showOverflow === false ? false : true) && (item.showOverflow === false ? false : true) && item.type !== 'columnTip'"
					>
						<template slot-scope="scope">
							<div v-if="item.type === 'taxRate'">
								<div v-if="option.edit && scope.row.edit && !item.readOnly">
									<div v-if="scope.row['receipayType'] === 'pay'">
										<el-select v-model="scope.row[item.prop]" :placeholder="'请选择' || ''" :disabled="item.notAllowed">
											<el-option v-for="(optionItem, j) in taxRateSelectOptions" :key="'select' + item.prop + j" :label="optionItem.label" :value="optionItem.value"></el-option>
										</el-select>
									</div>
									<div v-else v-html="scope.row[item.prop] ? scope.row[item.prop] * 100 + '%' : ''"></div>
								</div>
								<div v-else v-html="scope.row[item.prop] ? scope.row[item.prop] * 100 + '%' : ''"></div>
							</div>
							<el-input
								v-else-if="item.type === 'textarea'"
								v-lsNumber="{ value: item.inputType, obj: scope.row, key: item.prop, dot: item.dot }"
								type="textarea"
								class="finance-table-remark-textarea"
								:disabled="item.notAllowed"
								:placeholder="item.placeholder || '请输入'"
								clearable
								v-model="scope.row[item.prop]"
								:maxlength="item.maxlength || 500"
								show-word-limit
								@input="
									value => {
										item.input && item.input(value, scope.row, option)
									}
								"
								@change="
									value => {
										item.change && item.change(value, scope.row, option, true)
									}
								"
							></el-input>
							<template v-else-if="item.type === 'operationBtns'">
								<template v-for="(subItem, index) in item.operationBtns.data">
									<span :key="'operationBtns' + index" class="operationbtns-wrapper" v-if="subItem.show || subItem.showFn(scope.row) || (!subItem.showFn && scope.row.edit)">
										<el-button type="text" @click.stop="item.operationBtns.callback(subItem.action, scope.$index, scope.row, option)">{{ subItem.label }}</el-button>
									</span>
								</template>
							</template>
							<!-- 各类单号按钮，和文字按钮差异较大，简化配置，分离出来 -->
							<!-- 字符串转数组，此方法放在配置里比数据返回时加_multiValue字段更直观便捷 -->
							<!-- item.orderNoBtn === true 时是默认的方法，返回的格式是逗号给开的字符串，如果不是此格式，则需定义orderNoBtn为函数 -->
							<div v-else-if="item.type === 'button' && item.orderNoBtn" :class="{ orderNoBtns: (item.orderNoBtn === true ? scope.row[item.prop].split(',') : item.orderNoBtn(scope.row[item.prop])).length > 1 }">
								<!-- FinanceTableMss不支持换行，FinanceTable也将不支持，type为button且有multiValue需迁移到columnTip类型 -->
								<el-button
									style="width:100%"
									v-for="(subItem, index) in item.orderNoBtn === true ? scope.row[item.prop].split(',') : item.orderNoBtn(scope.row[item.prop])"
									:key="item.prop + '_orderNo_' + index"
									type="text"
									class="underline no-margin"
									@click.stop="item.callback(subItem, scope.row, item, option)"
									>{{ subItem }}</el-button
								>
							</div>
							<!-- 单号类按钮，单选、多选均使用该按钮，配置方便，需单独设置跳转方法 TODO -->
							<!-- <div v-else-if="item.type === 'orderNoBtn' && item.orderNoBtn" class="orderNoBtn">
              <template v-if="(item.orderNoBtn===true?scope.row[item.prop].split(','):item.orderNoBtn(scope.row[item.prop])).length<2">
                <el-button
                  type="text"
                  class="underline no-margin"
                  @click.stop="item.callback(scope.row[item.prop],scope.row,item,option)"
                >{{scope.row[item.prop]}}</el-button>
              </template>
              <template v-else>
                <el-popover
                  v-model="item['popoverShow_'+scope.$index]"
                  popper-class="table-popover"
                  placement="right-start"
                  width="200"
                  trigger="hover">
                  <el-button
                    v-for="(subItem, index) in (item.orderNoBtn===true?scope.row[item.prop].split(','):item.orderNoBtn(scope.row[item.prop]))"
                    :key="item.prop + '_orderNo_' + index"
                    type="text"
                    @click.stop="()=>{
                      item['popoverShow_'+scope.$index] = false
                      item.componentProps.callback(subItem, item, index,scope.$index)
                      }"
                  >{{subItem}}</el-button>
                  <el-button slot="reference">{{scope.row[item.prop]}}</el-button>
                </el-popover>
              </template>
              </div>-->
							<div v-else-if="item.type === 'button' && item.operationBtns && item.operationBtns.show">
								<template v-if="item.operationBtns.data && item.operationBtns.data.length > 0">
									<div v-if="scope.row[item.prop] && scope.row[item.prop][0] === '*'">
										*
									</div>
									<template v-else-if="scope.row[item.prop] && scope.row[item.prop] !== ''">
										<el-button
											style="width: 100%"
											:style="item.operationBtns.style"
											v-for="(subItem, index) in item.operationBtns.data"
											:key="'itemOperationBtns' + index"
											type="text"
											class="underline"
											@click.stop="item.operationBtns.callback(subItem.action, scope.$index, scope.row, option)"
											>{{ subItem.label }}</el-button
										>
									</template>
									<div v-else>无</div>
								</template>
								<template v-else>
									<!-- FinanceTableMss不支持换行，FinanceTable也将不支持，type为button且有multiValue需迁移到columnTip类型 -->
									<template v-if="scope.row[item.prop + '_multiValue']">
										<el-button
											style="width: 100%"
											v-for="(subItem, index) in scope.row[item.prop + '_multiValue']"
											:class="[item.hasMargin ? '' : 'no-margin', `${scope.row[item.prop + '_multiValue'].length > 1 ? 'scale-big' : ''}`]"
											:key="item.prop + '_multiValue' + index"
											type="text"
											class="underline"
											@click.stop="item.operationBtns.callback(item.action, scope.$index, scope.row, option, subItem, index)"
											>{{ subItem }}</el-button
										>
									</template>
									<template v-else-if="item.prop === 'fileName'">
										<div style="color:#1890ff;cursor:pointer;" v-for="(subItem, subIndex) in scope.row.fileName ? scope.row.fileName.split(',') : []" :key="subIndex" @click.stop="item.operationBtns.callback(item.action, subIndex, scope.row, option)">
											{{ subItem }}
										</div>
									</template>
									<template v-else>
										<el-button style="width: 100%" type="text" class="underline" @click.stop="item.operationBtns.callback(item.action, scope.$index, scope.row, option)">{{
											item.formatter ? item.formatter(scope.row[item.prop], scope.row) : scope.row[item.prop]
										}}</el-button>
									</template>
								</template>
							</div>
							<div v-else-if="item.type === 'button' && item.callback">
								<el-button style="width: 100%" :key="'itemOperationBtns' + index" type="text" class="underline" @click.stop="item.callback(scope.row, item.prop)">{{ scope.row[item.prop] }}</el-button>
							</div>
							<div v-else-if="item.type === 'fileButton'">
								<el-button style="width: 100%" :key="'fileButton' + index" type="text" class="no-underline" @click.stop="fileDownLoad(scope.row[item.downLoadPath])">{{ scope.row[item.prop] }}</el-button>
							</div>
							<div v-else-if="item.type === 'columnTip'">
								<!-- <template> -->
								<div
									v-if="item.componentProps.formatter"
									class="finance-column-tip"
									@mouseenter="
										$event => {
											item.componentProps.show = true
											item.componentProps.event = $event
											item.componentProps.row = scope.row
											currentComponent = item.component
											componentProps = item.componentProps
										}
									"
									@mouseleave="
										() => {
											item.componentProps.show = false
										}
									"
								>
									<template v-if="scope.row[item.prop + '_multiValue']">
										<div>
											{{ scope.row[item.prop + '_multiValue'].join(',') }}
										</div>
									</template>
									<template v-else>
										<div>
											{{ scope.row[item.prop] }}
										</div>
									</template>
								</div>
								<!-- !item.componentProps.click &&  -->
								<template v-else-if="scope.row[item.prop + '_multiValue']">
									<div>
										<div v-if="scope.row[item.prop + '_multiValue'].length <= 1">
											<!-- class="finance-column-tip-btns" -->
											<div v-if="item.componentProps.callback">
												<!-- <el-button
                          v-for="(subItem, index) in scope.row[item.prop + '_multiValue']"
                          :key="item.prop + '_multiValue' + index"
                          type="text"
                          style="display:block;margin:0 auto;width:100%;"
                          class="finance-column-tip underline"
                          @click="item.componentProps.row = scope.row;item.componentProps.callback(subItem, item.componentProps, index);"
                        >{{subItem}}</el-button> -->
												<a
													v-for="(subItem, index) in scope.row[item.prop + '_multiValue']"
													:key="item.prop + '_multiValue' + index"
													href="#"
													style="color: #1890ff"
													class="underline"
													@click="
														item.componentProps.row = scope.row
														item.componentProps.callback(subItem, item.componentProps, index)
													"
													>{{ subItem }}</a
												>
											</div>
											<div v-else>
												<div v-for="(subItem, index) in scope.row[item.prop + '_multiValue']" :key="item.prop + '_multiValue' + index" type="text" style="text-align: center">
													{{ subItem }}
												</div>
											</div>
										</div>
										<div
											v-else
											class="finance-column-tip"
											@mouseenter="
												$event => {
													item.componentProps.show = true
													item.componentProps.event = $event
													item.componentProps.data = scope.row[item.prop + '_multiValue']
													item.componentProps.row = scope.row
													currentComponent = item.component
													componentProps = item.componentProps
												}
											"
											@mouseleave="
												() => {
													item.componentProps.show = false
												}
											"
										>
											{{ scope.row[item.prop + '_multiValue'].join(',') + '...' }}
										</div>
									</div>
								</template>
								<!-- <template v-else-if="item.componentProps.click">
                <div
                  class="finance-column-tip"
                  @click="item.componentProps.show = true;item.componentProps.event = $event;item.componentProps.row = scope.row;currentComponent = item.component;componentProps = item.componentProps;"
                >{{scope.row[item.prop]}}</div>
                </template>-->
								<!-- <template v-else>
                <el-button
                  type="text"
                  @click="item.operationBtns.callback(item.action, scope.$index, scope.row, option)"
                >{{scope.row[item.prop]}}</el-button>
                </template>-->
								<!-- </template> -->
							</div>
							<div v-else-if="item.type === 'text'" v-html="renderNoEdit(scope.row, item)" style="display: inline"></div>
							<div v-else-if="option.edit && scope.row.edit && !item.readOnly" @click.stop>
								<el-input v-if="item.type === 'number'" type="number" :disabled="item.notAllowed" placeholder="请输入" v-model="scope.row[item.prop]"></el-input>
								<el-input
									v-if="item.type === 'input'"
									v-lsNumber="{
										value: item.inputType,
										obj: scope.row,
										key: item.prop,
										dot: item.dot
									}"
									:disabled="item.notAllowed"
									:placeholder="item.placeholder || '请输入'"
									clearable
									v-model="scope.row[item.prop]"
									:maxlength="item.maxlength || 500"
									@input="
										value => {
											item.validateInput && item.validateInput(value, scope.row, item)
										}
									"
									@change="
										value => {
											item.validateInput && item.validateInput(value, scope.row, item, true)
										}
									"
									@keyup.native="
										evt => {
											option.handleKeyup && option.handleKeyup(evt, option, scope.row, scope.$index)
										}
									"
									@blur="
										evt => {
											option.handleBlur && option.handleBlur(evt, option, scope.row, scope.$index)
										}
									"
								></el-input>
								<el-autocomplete
									v-if="item.type === 'autocomplete'"
									v-model="scope.row[item.prop]"
									:value-key="item.value ? item.value : 'value'"
									placeholder="请输入"
									:clearable="item.clearable"
									:select-when-unmatched="true"
									:debounce="item.debounce || 300"
									:fetch-suggestions="
										(queryString, cb) => {
											item.querySearch && item.querySearch(queryString, cb, scope.row, item)
										}
									"
									@select="
										value => {
											item.select && item.select(value, scope.row, item)
										}
									"
									@change="
										value => {
											item.change && item.change(value, scope.row, item)
										}
									"
									@clear="
										() => {
											setBlur(scope.row, item)
											item.clear && item.clear(scope.row, item)
										}
									"
									@focus="
										() => {
											item.focus && item.focus(scope.row)
										}
									"
								></el-autocomplete>
								<!-- @clear="() => {setBlur(scope.row, item);item.clear && item.clear(scope.row, item)}" -->
								<div v-if="item.type === 'datePicker'" class="finance-table-datepicker">
									<el-date-picker v-model="scope.row[item.prop]" type="date" placeholder="选择日期" :value-format="item.valueFormat"></el-date-picker>
								</div>
								<div v-if="item.type === 'dateRange'" class="finance-table-datepicker">
									<el-date-picker v-model="scope.row[item.prop]" type="daterange" :value-format="item.valueFormat || ''" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
								</div>
								<div v-if="item.type === 'upload'">
									<el-upload
										class="finance-table-upload"
										action="str"
										:limit="item.limit || 1"
										:on-exceed="handleExceed"
										:file-list="scope.row['fileList'] || []"
										:before-upload="
											file => {
												getFile(file, scope.row)
											}
										"
										:on-change="
											(file, fileList) => {
												handleChangeFile(file, fileList, scope.row)
											}
										"
										:on-remove="
											(file, fileList) => {
												handleRemove(file, fileList, scope.row)
											}
										"
										:http-request="
											() => {
												handleImport(scope.row)
											}
										"
									>
										<el-button type="text" class="noselect" v-show="showUploadBtn" size="mini">点击上传</el-button>
									</el-upload>
								</div>

								<div v-if="item.type === 'select'">
									<div v-if="!item.remote">
										<el-select
											v-model="scope.row[item.prop]"
											:placeholder="'请选择' || ''"
											:filterable="item.filterable"
											:allow-create="item.allowCreate"
											:disabled="item.notAllowed"
											@change="
												value => {
													item.change && item.change(value, scope.row, scope.$index)
												}
											"
										>
											<el-option
												v-for="(optionItem, j) in (item.propInDict && item.propInDict !== '' ? dictMap[item.propInDict] : dictMap[item.prop] || item.selectOptions) || []"
												:key="'select' + item.prop + j"
												:label="optionItem.label"
												:value="optionItem.value"
											></el-option>
										</el-select>
									</div>
									<el-select
										v-else
										v-model="scope.row[item.prop]"
										:placeholder="'请输入'"
										filterable
										remote
										:remote-method="
											queryString => {
												item.remoteMethod && item.remoteMethod(queryString, item, scope.row)
											}
										"
										@visible-change="
											value => {
												if (value) {
													item.visibleChange && item.visibleChange('', item, scope.row)
												}
											}
										"
										@change="
											value => {
												item.change && item.change(value, item, scope.row)
											}
										"
									>
										<el-option v-for="(optionItem, j) in item.remoteSelectList || []" :key="'select' + item.prop + j" :label="optionItem.label" :value="optionItem.value"></el-option>
									</el-select>
								</div>
							</div>
							<div v-else-if="item.type === 'timeRange'" v-html="timeRangeRender(scope.row, item)"></div>
							<!-- 自定义树级表格 -->
							<template v-else-if="option.multiRow">
								<template v-if="item.arrow">
									<i
										v-if="scope.row[option.multiKey].length > 1"
										class="el-icon el-icon-arrow-right"
										:class="{ active: scope.row.toggle }"
										@click.stop="
											() => {
												scope.row.toggle = !scope.row.toggle
											}
										"
									></i>
									{{ scope.row[item.prop] }}
								</template>
								<template v-else-if="item.multi && item.forceTooltip">
									<div v-for="(child, index) in scope.row[option.multiKey]" :key="index" :class="{ noBorder: !scope.row.toggle }" v-show="index == 0 || scope.row.toggle">
										<el-tooltip :content="(item.formatter && item.formatter(child)) || child[item.prop]" placement="top" effect="dark">
											<span>{{ (item.formatter && item.formatter(child)) || child[item.prop] }}</span>
										</el-tooltip>
									</div>
								</template>
								<template v-else-if="item.multi">
									<div v-for="(child, index) in scope.row[option.multiKey]" :key="index" :class="{ noBorder: !scope.row.toggle }" v-show="index == 0 || scope.row.toggle" v-html="(item.formatter && item.formatter(child)) || child[item.prop]"></div>
								</template>
								<template v-else>{{ scope.row[item.prop] }}</template>
							</template>
							<div v-else style="display: inline">
								<!-- tooltip改成显示文本，省略由表格处理 -->
								<!-- <el-tooltip
                  class="finance-self-tooltip"
                  v-if="item.type === 'tooltip' && scope.row[item.prop] && scope.row[item.prop].length > (item.width || 80)/12"
                  :content="item.formatter ? item.formatter(scope.row) : scope.row[item.prop]"
                > -->
								<span v-if="item.type === 'tooltip'">{{ item.formatter ? item.formatter(scope.row) : scope.row[item.prop] }}</span>
								<!-- </el-tooltip> -->
								<el-link v-else-if="item.type === 'link'" type="primary" :underline="false" @click="item.callback(scope.row)">{{ scope.row[item.prop] }}</el-link>
								<template v-else-if="item.type == 'tag' && item.formatter(scope.row)">
									<span class="finance-self-tag" :class="[text.type]" v-for="text in item.formatter(scope.row)" :key="text.type">{{ text.text }}</span>
								</template>
								<div v-else v-html="renderNoEdit(scope.row, item)" style="display:inline"></div>
							</div>
						</template>
					</el-table-column>
				</template>
				<el-table-column label="操作" :align="option.operationBtns.align || 'center'" :width="option.operationBtns.width" :fixed="option.operationBtns.fixed" v-if="option.operationBtns && option.operationBtns.show">
					<template slot-scope="scope">
						<template v-for="(item, index) in option.operationBtns.data">
							<span :key="'operationBtns' + index" class="operationbtns-wrapper" v-if="item.show || item.showFn(scope.row) || (!item.showFn && scope.row.edit)">
								<!-- v-if="scope.row.edit || item.show || item.showFn(scope.row)" -->
								<el-button type="text" @click.stop="option.operationBtns.callback(item.action, scope.$index, scope.row, option)">{{ item.label }}</el-button>
							</span>
						</template>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div class="finance-list-amt-summary" v-if="option.listAmtSummary && option.listAmtSummary.show">
			<slot name="listAmtSummary">
				<div class="money-box">
					<div class="money-box-left">
						<div class="money-total" v-for="(value, key) in option.listAmtSummary.data" :key="'listAmtSummary' + key">
							<span>
								{{ option.listAmtSummary.labelObj && option.listAmtSummary.labelObj[key + 'Label'] }}：
								<span v-for="(item, index) in value" :key="key + index">
									{{ item.currency }}<span :style="{ color: option.listAmtSummary.colorObj && option.listAmtSummary.colorRgbObj[option.listAmtSummary.colorObj[key + 'Color']] }">{{ item.amt }}</span
									><span v-html="'&nbsp;'"></span>
								</span>
								<span v-if="value && !value.length">无</span>
							</span>
						</div>
					</div>
				</div>
			</slot>
		</div>
		<div class="finance-el-pagination" v-if="option.pagination && option.pagination.show">
			<Tips v-if="option.tips" :tips="option.tips" :callback="handleTableClearSelection" />
			<div class="pagination-container">
				<el-pagination
					size="mini"
					background
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
					:current-page.sync="option.pagination.currPage"
					:page-size="option.pagination.pageSize"
					:total="Number(option.pagination.totalCount)"
					:page-sizes="[10, 20, 50, 100, 200]"
					:pager-count="5"
					layout="total, prev, pager, next, jumper, sizes"
				></el-pagination>
			</div>
		</div>
		<div class="finance-tips-container" v-else>
			<Tips v-if="tips" :tips="tips" :callback="handleTableClearSelection" />
		</div>
		<component :is="currentComponent" :component-props="componentProps" />
	</div>
</template>
<script>
import Tips from '../Tips/index'
import { mapGetters } from 'vuex'
export default {
	name: 'financeTable',
	props: {
		option: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			tips: this.option.tips,
			multipleSelection: [],
			showServiceCodeSelect: true,
			showUploadBtn: true,
			defaultFileSize: 5,
			// hasFinanceTableUpload: false,
			financeTableUpload: null,
			currentComponent: '',
			componentProps: {},
			scrollTop: null,
			scrollLeft: null,
			taxRateSelectOptions: [
				{ label: '0%', value: 0 },
				{ label: '3%', value: 0.03 },
				{ label: '6%', value: 0.06 },
				{ label: '9%', value: 0.09 },
				{ label: '12%', value: 0.12 }
			]
		}
	},
	computed: {
		columns() {
			if (this.option.columns) {
				let name = this.option.$name
				let financeTablesInfoStr = window.localStorage.getItem('financeTablesInfoStr')
				return this.option.columns.filter(item => {
					if (name && financeTablesInfoStr) {
						let financeTablesInfo = JSON.parse(financeTablesInfoStr)
						let arr = financeTablesInfo[name]
						arr = arr ? arr : []
						let f = arr.find(item2 => {
							return item2.prop === item.prop
						})
						if (f) {
							item.width = f.width
						}
					}
					return item
				})
			} else {
				return []
			}
		},
		...mapGetters(['dictMap', 'dictMapObj'])
	},
	created() {
		// console.log(this.dictMap)
		// console.log(this.dictMapObj)
		// 组件构造函数是 VueComponent, VueComponent构造函数才是Vue
		this.__proto__.__proto__.__table__ = this
	},
	mounted() {
		// setTimeout(() => {
		//   if (this.option.columns.some(item => {
		//     return item.type === 'upload'
		//   })) {
		//     this.hasFinanceTableUpload = true
		//   }
		// }, 3000)
		this.$refs.tableLayout_finance.bodyWrapper.addEventListener(
			'scroll',
			evt => {
				let t = evt.target
				this.scrollTop = t.scrollTop
				this.scrollLeft = t.scrollLeft
			},
			false
		)
	},
	methods: {
		timeRangeRender(row, item) {
			let startTime = row[item.rangeStr[0]]
			let stopTime = row[item.rangeStr[1]]
			if (!startTime && !stopTime) return
			if (item.sliceRange) {
				startTime = startTime && startTime.slice(...item.sliceRange)
				stopTime = stopTime && stopTime.slice(...item.sliceRange)
			}
			return startTime + '~' + stopTime
		},
		renderNoEdit(row, item) {
			let { formatter, prop, type, selectOptions, selectOptionsObj, propInDict, defaultVal } = item
			if (prop == '')
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
				if (dict) {
					if (item.multi) {
						// console.log(item);
						// 后端返回多字符串supplier,customer转化对应字典 结算单位
						// crm有自定义的类型，字典内没有，此种类型需要处理为空字符串
						obj = row[prop].replace(/\b(\w+)\b/g, item2 => {
							if (item.noDict) return (dict && dict[item2]) || ''
							return (dict && dict[item2]) || rowProp
						})
					} else {
						obj = dict && dict[rowProp]
					}
				} else if (selectOptions) {
					obj = selectOptions.find(item => (item.value + '').toLowerCase() === rowProp)
					obj = obj && obj.label
				}
				if (item.noDict) return obj || ''
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
		// // 解决选择费用项后自动带出服务项，但此时el-select选不中的问题---空值，停用
		// serviceCodeSelectChange(val, row, prop) {
		//   console.log(val)
		//   this.showServiceCodeSelect = false
		//   this.$nextTick(() => {
		//     this.showServiceCodeSelect = true
		//     // 此时row.serviceName未设置成对应的值，回传后台并不传此值，所以并无影响
		//   })
		// },
		// 取消多选
		handleTableClearSelection(action) {
			this.$refs.tableLayout_finance.clearSelection()
			// this.callback(action)
		},
		// 选择触发
		handleMuti(data) {
			this.multipleSelection = data
			Object.assign(
				this.tips,
				this.option.rootTipsHide
					? {}
					: {
							show: data.length ? true : false,
							text: data.length ? `已选择 ${data.length} 项` : ''
					  }
			)
			this.$emit('send-multi', data, this.option)
		},
		handleRowClick(row, column) {
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
		resizableChange(newWidth, oldWidth, column, event) {
			console.log(newWidth, column)
			console.log(this.option.$name)
			let name = this.option.$name
			if (!name) return
			this.debounceLs(() => {
				let prop = column.property
				let width = newWidth
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
		rowClassNameFunc({ row, rowIndex }) {
			if (row._isChanged) {
				return 'finance-table-row-changed'
			}
			if (row._isInvalid) {
				return 'finance-table-row-invalid'
			}
			if (row._isRefused) {
				return 'finance-table-row-refused'
			}
			if (row.invisible) {
				return 'finance-table-row-invisible'
			}
			if (row.redMark) {
				return 'finance-table-row-redmark'
			}
			// 多选选中样式
			if (this.multipleSelection && this.multipleSelection.indexOf(row) > -1) {
				return 'select-row-class'
			}
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
		handleSizeChange(val) {
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
		handleScroll() {
			setTimeout(() => {
				if (this.$route.meta.isUseCache) {
					var t = this.$el.querySelector('.el-table__body-wrapper')
					t.scrollTop = this.scrollTop
					t.scrollLeft = this.scrollLeft
				}
			}, 1)
			// 13
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
		handleRemove(file, fileList) {
			console.log(file, fileList)
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
					params: form
				})
				.then(res => {
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
							duration: 1000
						})
					} else {
						this.$message({
							type: 'error',
							message: res.data.msg,
							duration: 1000
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
			api(formData).then(res => {
				param.onSuccess(res)
			})
		},
		uploadSuccess(response, file, fileList) {
			console.log(response)
			this.showUploadBtn = false
		},
		getSelectOptionsWrap(prop) {
			return this[prop + 'Wrap']
		},
		// 手动选择行 凭证设置-核算维度
		setCurrentRow(row) {
			this.$refs.tableLayout_finance.toggleRowSelection(row, true)
		},
		sumMethod({ columns, data }) {
			return this.$attrs.sumMethod({ columns, data })
		},
		// renderNoEditAutocomplete(prop, row) {
		//   if (row[prop + '__autocompleteValue']) {
		//     // 如果有这个值，显示这个值
		//     return row[prop + '__autocompleteValue']
		//   }
		//   if (prop.indexOf('Code') > 0) {
		//     // 接口返回的数据无__autocompleteValue字段，这时换成显示...Name的值
		//     prop = prop.replace('Code', 'Name')
		//   }
		//   return row[prop]
		// },
		// 表格内附件下载
		fileDownLoad(path) {
			window.open(path)
		}
	},
	activated() {
		// console.log('this.$route.meta.isUseCache', this.$route.meta.isUseCache)
		// if (this.$route.meta.isUseCache) {
		this.handleScroll()
		this.__proto__.__proto__.__table__ = this
		// }
	},
	beforeDestroy() {
		this.$refs.tableLayout_finance.bodyWrapper.removeEventListener(
			'scroll',
			evt => {
				let t = evt.target
				this.scrollTop = t.scrollTop
				this.scrollLeft = t.scrollLeft
			},
			false
		)
	},
	components: {
		Tips
	},
	watch: {
		'option.data': {
			handler(newVal) {
				if (this.option.hasFinanceTableUpload) {
					let _this = this
					this.$nextTick(() => {
						let financeTableUploads = document.getElementsByClassName('finance-table-upload')
						financeTableUploads.forEach(item => {
							item.addEventListener(
								'click',
								(function(Obj) {
									_this.financeTableUpload = Obj
								})(item)
							)
						})
					})
				}
			},
			deep: true
		}
		// 'option.hardCheckRows': {
		// 	handler (newVal) {
		// 		if (newVal) {
		// 			this.option.data.forEach(row => {
		// 				if (newVal.some(check => {
		// 					return check === row
		// 				})) {
		// 					this.$refs.tableLayout_finance.toggleRowSelection(row, true)
		// 				} else {
		// 					this.$refs.tableLayout_finance.toggleRowSelection(row, false)
		// 				}
		// 			})
		// 		}
		// 	},
		// 	deep: true
		// }
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
	position: relative;
}
.finance-el-table {
	padding: 8px;
	background: #fff;
	position: relative;
	::v-deep.cell.el-tooltip {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		// .cell.el-tooltip默认最小50，自定义tag会显示异常
		min-width: 20px;
	}
}
.finance-el-table .el-button {
	font-size: 12px;
	color: #1890ff;
	padding: 0;
	border: none;
}
.finance-el-pagination {
	padding: 10px 0 10px;
	overflow: hidden;
	background: #fff;
	position: relative;
}
.finance-el-pagination .pagination-container {
	float: right;
}
.finance-tips-container {
	position: absolute;
	left: 0;
	bottom: -14px;
	height: 14px;
	width: 200px;
	.tips-abs {
		top: 5px;
		::v-deep.tips-container {
			padding-left: 0;
		}
	}
}
/* 多选选中样式 */
.finance-table ::v-deep .select-row-class td {
	background-color: #e8f4ff !important;
}
.finance-list-amt-summary .money-box {
	background: #f8f9fd !important;
	margin: 0px 8px;
}
.finance-list-amt-summary .money-total {
	min-width: 100px;
	margin-right: 24px;
}
.finance-list-amt-summary .money-box-left .money-total:last-of-type {
	margin-right: 0;
}
.finance-list-amt-summary .money-total span {
	color: #4a4a4a;
}

/* .finance-table .finance-self-tag {
	display: inline-block;
	width: 18px;
	height: 18px;
	margin-left: -8px;
	margin-right: -8px;
	line-height: 18px;
	border-radius: 4px;
	padding: 0;
	text-align: center;
	border: none;
	color: white;
	font-size: 12px;
}
.finance-table .finance-self-tag + .finance-self-tag {
	margin-left: 12px;
} */
.finance-table .finance-table-row-changed {
	background-color: #fdf2e8;
}
.finance-table .finance-table-row-changed .finance-self-tag {
	background-color: #ef8519;
}
.finance-table .finance-table-row-refused {
	background-color: #fff0f1;
}
.finance-table .finance-table-row-refused .finance-self-tag {
	background-color: #ef8519;
}
.finance-table .finance-table-row-refused .finance-self-tag.refuse {
	background-color: #cd4130;
}
.finance-table .finance-table-row-invalid {
	background-color: #e9e8eb;
}
.finance-table .finance-table-row-invalid .finance-self-tag {
	background-color: #b3b3b3;
}
</style>
<style>
/* .finance-table .el-table--border th {
  border-right: 1px solid #dfe6ec;
} */
.finance-table .el-table td .cell div {
	line-height: 14px;
}
.finance-table .finance-table-datepicker .el-input__inner {
	/* padding: 0 30px; */
	padding: 0 15px 0 18px;
}
.finance-table .el-date-editor.el-input {
	width: auto;
}

.finance-el-table .finance-table-upload .el-button {
	padding: 7px 10px;
}
/* 又说不要下划线，class改成no-underline---其他处又有下划线 */
.finance-table .underline {
	text-decoration: underline;
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

/* #B3B3B3  失效图标背景*/
/* #EF8519  改字图标背景*/
/* color: #cd4130;  拒字图标背景*/
</style>
<style>
/* 用于element计算右侧列高度不准确的情况 */
.finance-table .el-table__fixed-right {
	min-height: 70px !important;
}
.finance-table .el-table__fixed {
	min-height: 70px !important;
}

.finance-table .finance-table-row-invisible {
	display: none !important;
}
.finance-table-row-redmark td {
	color: #ff4949;
}

.finance-table .operationbtns-wrapper + .operationbtns-wrapper {
	margin-left: 6px;
}
.finance-table .operationbtns-wrapper .el-button {
	padding: 0 2px;
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
</style>
