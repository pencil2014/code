<template>
	<div class="filter-flex">
		<div class="filter-search" :class="item.isReadOnly ? 'readOnly' : ''">
			<div class="item width120">
				<span class="filter-txt" v-if="item.isReadOnly"> {{ item.label }}： </span>
				<el-select
					v-else
					ref="searchFilterKey"
					v-model="item.key"
					size="mini"
					:disabled="isOrderCreatedTime(item)"
					filterable
					:placeholder="item.placeholder || '请选择'"
					@visible-change="
						val => {
							if (!val) this.$refs.searchFilterKey.blur()
						}
					"
					@change="
						val => {
							handleSelectQuery(val, index, item)
						}
					"
				>
					<el-option v-for="(child, key) in allFilterGroups[item.category]" :key="key" :label="child.label" :value="key" :disabled="filterKeyDisabled(child)"></el-option>
				</el-select>
			</div>
			<div class="flex1">
				<div class="multi-select-tag" v-if="filterGroups[item.key]">
					<el-input
						size="mini"
						v-if="['input', 'textarea'].includes(filterGroups[item.key].type)"
						v-model="item.value"
						:type="filterGroups[item.key].type"
						:style="filterGroups[item.key].style || defaultStyle"
						:maxlength="filterGroups[item.key].maxlength"
						:minlength="filterGroups[item.key].minlength"
						:placeholder="filterGroups[item.key].placeholder || '请输入' + filterGroups[item.key].label"
						:clearable="filterGroups[item.key].clearable || true"
						:disabled="filterGroups[item.key].disabled"
						:rows="filterGroups[item.key].rows"
						:autosize="filterGroups[item.key].autosize"
						:name="filterGroups[item.key].name"
						:readonly="filterGroups[item.key].readonly"
						:max="filterGroups[item.key].max"
						:min="filterGroups[item.key].min"
						@keyup.enter.native="handleSearch"
						@blur="handleClearEmptyString(item, $event)"
					/>

					<el-autocomplete
						size="mini"
						v-if="filterGroups[item.key].type === 'autocomplete'"
						class="inline-input"
						v-model="item.value"
						:type="filterGroups[item.key].type"
						:style="filterGroups[item.key].style || defaultStyle"
						:clearable="filterGroups[item.key].clearable || true"
						:disabled="filterGroups[item.key].disabled"
						:fetch-suggestions="
							(queryString, cb) => {
								filterGroups[item.key].querySearch && filterGroups[item.key].querySearch(queryString, cb)
							}
						"
						:placeholder="filterGroups[item.key].placeholder || '请输入' + filterGroups[item.key].label"
						@change="
							value => {
								filterGroups[item.key].change && filterGroups[item.key].change(value, filterGroups[item.key])
							}
						"
						@select="
							value => {
								filterGroups[item.key].select && filterGroups[item.key].select(value, filterGroups[item.key])
							}
						"
						@clear="
							value => {
								filterGroups[item.key].clear && filterGroups[item.key].clear(value, filterGroups[item.key])
							}
						"
					></el-autocomplete>

          <!-- 远程搜索 -->
          <el-select size="mini"  v-if="isShow&&filterGroups[item.key].type === 'remoteSelect'"
            v-model="item.value"
            filterable
            remote
            ref="remoteSelect"
            class="remoteSelect"
						:reserve-keyword="!filterGroups[item.key].notReserveKeyword"
            :clearable="filterGroups[item.key].clearable || true"
            :disabled="filterGroups[item.key].disabled"
            :multiple="filterGroups[item.key].multiple"
            :allow-create="filterGroups[item.key]['allow-create']"
            :collapse-tags="filterGroups[item.key]['collapse-tags']"
            :style="filterGroups[item.key].style || defaultStyle"
            :popper-class="filterGroups[item.key]['popper-class']"
            :placeholder="filterGroups[item.key].placeholder  || '请选择' + filterGroups[item.key].label"
            :remote-method="(val) => {filterGroups[item.key].filterMehod && filterGroups[item.key].filterMehod(val, filterGroups[item.key])}"
            @visible-change="(val) => {
              if (!val) {
                this.$refs.remoteSelect.blur()
              } else {
								filterGroups[item.key].visibleChange && filterGroups[item.key].visibleChange(val, filterGroups[item.key])
							}
            }"
            @change="remoteSelectChange"
          >
            <el-option
              v-for="item in filterGroups[item.key].data"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
    
          <el-select size="mini" v-if="filterGroups[item.key].type === 'select'"
            v-model="item.value"
            ref="select"
            :style="filterGroups[item.key].style || defaultStyle"
            :multiple="filterGroups[item.key].multiple"
            :disabled="filterGroups[item.key].disabled"
            :clearable="filterGroups[item.key].clearable || true"
            :collapse-tags="filterGroups[item.key]['collapse-tags']"
            :multiple-limit="filterGroups[item.key]['multiple-limit']"
            :name="filterGroups[item.key].name"
            :filterable="filterGroups[item.key].filterable"
            :allow-create="filterGroups[item.key]['allow-create']"
            :popper-class="filterGroups[item.key]['popper-class']"
            :placeholder="filterGroups[item.key].placeholder  || '请选择' + filterGroups[item.key].label"
            @visible-change="(val) => {
              if (!val) {
                this.$refs.select.blur()
              } else {
								filterGroups[item.key].visibleChange && filterGroups[item.key].visibleChange(val, filterGroups[item.key])
							}
            }"
            @change="(value) => {filterGroups[item.key].change ? filterGroups[item.key].change(value, filterGroups[item.key]) : remoteSelectChange(value)}">
              <el-option size="mini" v-for="(o, key) in selectOptions(item)"
                :key="key"
                :label="filterGroups[item.key].nonDictionary ? o.label : $t(`dict.${item.key}.${o.value}`)"
                :value="o.value">
              </el-option>
          </el-select>
          <!-- 日期和时间{year/month/date/dates/ week/datetime/datetimerange/daterange} --> 
          <el-date-picker size="mini" v-if="filterGroups[item.key].type === 'date'"
            v-model="item.value"
            :type="filterGroups[item.key].category"
            :name="filterGroups[item.key].name"
            :style="filterGroups[item.key].style || defaultStyle"
            :readonly="filterGroups[item.key].readonly"
            :disabled="filterGroups[item.key].disabled"
            :editable="filterGroups[item.key].editable"
            :clearable="!isOrderCreatedTime(item) && filterGroups[item.key].clearable"
            :range-separator="filterGroups[item.key]['range-separator']"
            :start-placeholder="filterGroups[item.key]['start-placeholder'] || '开始时间'"
            :end-placeholder="filterGroups[item.key]['end-placeholder'] || '结束时间'"
            :placeholder="filterGroups[item.key].placeholder || '请选择' + filterGroups[item.key].label"
            :format="filterGroups[item.key].format"
            :align="filterGroups[item.key].align"
            :popper-class="filterGroups[item.key]['popper-class']"
            :default-value="filterGroups[item.key]['default-value']"
            :default-time="filterGroups[item.key]['default-time']"
            :value-format="filterGroups[item.key].format"
            :picker-options="filterGroups[item.key].pickerOptions" />
					<template v-if="filterGroups[item.key].type === 'date2'">
						<span class="date-2-class">
               <el-date-picker size="mini"
									v-model="startDate"
									type="date"
									:name="filterGroups[item.key].name"
									:style="filterGroups[item.key].style || defaultStyleDate2"
									:readonly="filterGroups[item.key].readonly"
									:disabled="filterGroups[item.key].disabled"
									:editable="filterGroups[item.key].editable"
									:clearable="filterGroups[item.key].clearable"
									:placeholder="filterGroups[item.key]['start-placeholder'] || '开始时间'"
									:picker-options="filterGroups[item.key].pickerOptionsStart || pickerOptionsStart"
									:align="filterGroups[item.key].align"
									:popper-class="filterGroups[item.key]['popper-class']"
									:default-value="filterGroups[item.key]['default-value'] && filterGroups[item.key]['default-value'][0]"
									:default-time="filterGroups[item.key]['default-time']"
									:value-format="filterGroups[item.key].format"
									@change="dateChange2"
								/>	
								<el-date-picker size="mini"
									v-model="endDate"
									type="date"
									:name="filterGroups[item.key].name"
									:style="filterGroups[item.key].style || defaultStyleDate2"
									:readonly="filterGroups[item.key].readonly"
									:disabled="filterGroups[item.key].disabled"
									:editable="filterGroups[item.key].editable"
									:clearable="filterGroups[item.key].clearable"
									:placeholder="filterGroups[item.key]['end-placeholder'] || '结束时间'"
									:picker-options="filterGroups[item.key].pickerOptionsEnd || pickerOptionsEnd"
									:align="filterGroups[item.key].align"
									:popper-class="filterGroups[item.key]['popper-class']"
									:default-value="filterGroups[item.key]['default-value'] && filterGroups[item.key]['default-value'][1]"
									:default-time="filterGroups[item.key]['default-time']"
									:value-format="filterGroups[item.key].format"
									@change="dateChange2"
								/>
						</span>
					</template>
					<el-cascader
            v-if="filterGroups[item.key].type === 'cascader'"
						class="order-search-cascader"
            filterable
            clearable
            size="mini"
            :options="filterGroups[item.key].cascaderList"
            v-model="item.value"
            @change="(value) => {filterGroups[item.key].change ? filterGroups[item.key].change(value, filterGroups[item.key]) : cascaderChange(value)}"
            :props="filterGroups[item.key].cascaderProps"
            :placeholder="filterGroups[item.key].placeholder || '请选择' + filterGroups[item.key].label"
            change-on-select
            expandTrigger="click"
          ></el-cascader>
        </div>
      </div>
    </div>
    <i class="el-icon-close filter-close" v-if="!isOrderCreatedTime(item) && (index + 1 > defaultSearchLength)" @click="handleDeleteFilter(index)"></i>
  </div>
  
</template>

<script>
import { mapGetters } from 'vuex'
import { formatDate } from '@/utils/index'

export default {
	name: 'searchAddFilter',
	data() {
		let self = this
		return {
			defaultStyle: {
				width: '100%'
			},
			defaultStyleDate2: {
				width: '50%'
			},
			isShow: true,
			cascaderSaveList: [],
			startDate: '',
			endDate: '',
			pickerOptionsStart: {
				disabledDate(time) {
					if (self.endDate) {
						let endDateTime = new Date(self.endDate)
						let timeVal = endDateTime.getTime() - time.getTime()
						return timeVal < 0
					} else {
						return false
					}
        }
			},
      pickerOptionsEnd: {
				disabledDate(time) {
					if (self.startDate) {
						let startDateTime = new Date(self.startDate)
						let timeVal = time.getTime() - startDateTime.getTime()
						return timeVal < -28800000
					} else {
						return false
					}
        }
			}
		}
	},
	props: {
		// 上述涉及的组件属性参数用法跟element-ui一致
		searchInputGroup: {
			type: Array,
			default: () => []
		},
		item: {
			type: Object,
			default: () => ({})
		},
		// 查询接口传参
		allFilterGroups: {
			type: Object,
			default: () => ({})
		},
		filterGroups: {
			type: Object,
			default: () => ({})
		},
		defaultSearchLength: {
			type: Number,
			default: 0
		},
		index: {
			type: Number,
			default: 0
		},
		callback: {
			type: Function,
			default: () => ({})
		},
		fixedCreatedTime: {
			type: Boolean,
			default: false
		}
	},
	watch: {
		'filterGroups': {
			 handler(newVal) { 
					this.mapDate2Method()
			 },
			 deep: true
		}
	},
	created() {},
	mounted() {
		setTimeout(() => {
        this.mapDate2Method()
		}, 1000)
	},
	computed: {
		...mapGetters(['dictMap'])
	},
	methods: {
		// 去除input输入框的首尾空格
    handleClearEmptyString(item, e) {
			item.value = e.target.value.trim()
    },
		isOrderCreatedTime(item) {
      return this.fixedCreatedTime && item.key === 'createdTime'
    },
		mapDate2Method() {
      if (this.filterGroups[this.item.key] && this.filterGroups[this.item.key].type === 'date2') {
				console.log('时间值是： ', this.item)
				if (this.item.value && this.item.value.length) {
						this.startDate = this.item.value[0] || ''
						this.endDate = this.item.value[1] || ''
				} else if (this.filterGroups[this.item.key]['default-value']) {
            this.startDate = this.filterGroups[this.item.key]['default-value'][0] || ''
						this.endDate = this.filterGroups[this.item.key]['default-value'][1] || ''
				} else {
						this.startDate = ''
						this.endDate = ''
				}
			}
		},
		// el-select下拉数据
		selectOptions(item) {
			// 前端设置的数据
			if (this.filterGroups[item.key].data && this.filterGroups[item.key].data.length) {
				return this.filterGroups[item.key].data
			}
			// 搜索条件的key和字典对应的key不相同
			if (this.filterGroups[item.key].propInDict) {
				return this.dictMap[this.filterGroups[item.key].propInDict]
			}
			// 默认按搜索条件的key做为字典的key
			return this.dictMap[this.filterGroups[item.key].key] || []
		},
		// 搜索条件下拉已被选中的置灰不可选
		filterKeyDisabled(child) {
			let keyArr = this.searchInputGroup.map(item => item.key)
			return keyArr.includes(child.key)
		},
		// 新增条件查询-选择下拉条件
		handleSelectQuery(val, index, item) {
			this.isShow = false
			setTimeout(()=>{
				this.isShow = true
			},0)
			this.item.value = ''
			this.startDate = ''
			this.endDate = ''
			
			
			// console.log('selectFilter', val, index, item);
			// console.log('searchInputGroup', this.searchInputGroup, this.filterGroups[val].label);
			// // 增加的查询条件和前面的一样，则替换掉前面的值
			// item.value = ''
			// item.label = this.filterGroups[val].label
			// item.key = val
			// item.fieldValue = ''
			// // this.searchInputGroup.forEach((item, sIndex) => {
			// //   if (index === sIndex) return
			// //   if (val && val === item.key) {
			// //     this.searchInputGroup[sIndex].key = ''
			// //   }
			// // })
			// // this.searchInputGroup[index].key = val
			// this.$set(this.searchInputGroup, 'key', val)
			// this.$set(this.searchInputGroup, 'label', this.filterGroups[val].label)
		},

		// 删除搜索条件
		handleDeleteFilter(index) {
			this.searchInputGroup.splice(index, 1)
			// console.log('删除一条:', this.searchInputGroup)
		},

		callbackAction(action) {
			if (typeof this.callback !== 'function') return
			this.callback(action)
		},

		handleSelectEnter() {
			this.callbackAction('Search')
		},

    handleSearch() {
      this.callbackAction('Search')
    },
		dateChange2() {
			if (this.startDate || this.endDate) {
        this.$set(this.item, 'value', [this.startDate, this.endDate])
			} else {
				this.$set(this.item, 'value', [])
			}
		},
    remoteSelectChange(val) {
      console.log('remoteSelectChange', val, this.item, this.filterGroups[this.item.key]);
      let key = this.item.key
      let filterGroups = this.filterGroups[key]
      let findItem = []
      // 多选
      if (filterGroups.multiple) {
				// 带远程搜索的
				if (filterGroups.type === 'remoteSelect') {
					findItem = filterGroups.data.filter(ele => val.includes(ele.value))
					if (filterGroups['allow-create']) {
						findItem = val.map(ele => {
							return {label: ele, value: ele}
						})
						// findItem = [{label: val, value: val}]
						this.$set(filterGroups, 'text', val)
					}
				}
				// 普通下拉的多选
        if (filterGroups.type === 'select') {
					let data = []
					if (this.dictMap[filterGroups.key]) {
						data = this.dictMap[filterGroups.key]
						// this.$set(filterGroups, 'data', this.dictMap[filterGroups.key])
					}
					if (this.dictMap[filterGroups.propInDict]) {
						data = this.dictMap[filterGroups.propInDict]
						// this.$set(filterGroups, 'data', this.dictMap[filterGroups.propInDict])
					}
					findItem = data.filter(ele => val.includes(ele.value))
					// findItem = filterGroups.data.filter(ele => val.includes(ele.value))
				}
      } else {
        findItem = filterGroups.data.filter(ele => ele.value === val)
        if (filterGroups['allow-create']) {
          findItem = [{label: val, value: val}]
          this.$set(filterGroups, 'text', val)
        }
      }
      let saveList = findItem.map(({label, value}) => ({label, value}))
      this.$set(filterGroups, 'queryValue', val)
      this.$set(filterGroups, 'saveList', saveList)
      if (filterGroups.valueAsLabelArr) {
        let valueAsLabelArr = saveList.map(item => {
          return item.label
        })
        this.$set(filterGroups, 'valueAsLabelArr', valueAsLabelArr)
      }
		},
		cascaderChange(val) {
			let key = this.item.key
			let filterGroups = this.filterGroups[key]
			this.cascaderSaveList = []
			this.getCascaderLabel(val, filterGroups.cascaderList)
			// console.log('this.cascaderSaveList', this.cascaderSaveList)
			this.$set(filterGroups, 'saveList', this.cascaderSaveList)
		},
		getCascaderLabel(deptCodeArr, data, saveList) {
			data.forEach((ele, index) => {
				if (deptCodeArr.includes(ele.deptCode)) {
					this.cascaderSaveList.push({label: ele.deptCname, value: ele.deptCode})
				}
				if (ele.childList && ele.childList.length) {
					this.getCascaderLabel(deptCodeArr, ele.childList)
				}
			})
			
		}
  }
}
</script>

<style lang="scss">
.date-2-class {
	position: relative;
	&::before {
		content: '-';
    position: absolute;
		color: #000;
    right: 92px;
    top: 2px;
		z-index: 999;
	}
	.el-date-editor.el-input.el-input--prefix {
		.el-input__inner {
			padding-left: 4px;
			padding-right: 15px;
		}
		.el-input__prefix {
			left: 64px;
			line-height: 19px;
			color: #c0c4cc;
		}
	}
	.el-date-editor.el-input.el-input--prefix:hover {
		.el-input__prefix {
			display: none;
		}
	}
	.el-date-editor.el-input.el-input--prefix:first-child {
		.el-input__prefix {
			display: none;
		}
		.el-input__inner {
			padding-left: 4px;
		  width: 100%;
			text-align: center;
		}
	}
}
.filter-search{
	.el-input__prefix {
    line-height: 20px;
	}
}
</style>
