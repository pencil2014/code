<template>
  <div
    style="min-height: 36px;"
    class="finance-search-form"
    :class="{borderBottom:$attrs.border,noLabelWidth:$attrs.noLabelWidth}"
  >
    <transition name="ls-fade">
      <!-- <el-form
        ref="form"
        :inline="true"
        size="mini"
        v-if="!(searchOption.saveShow || searchOption.saveDefault) || activeGetSearchKey"
      >-->
      <el-form ref="form" :inline="true" size="mini">
        <!-- label-width="84px" -->
        <el-form-item
          v-for="(item, index) in searchOption.columns"
          :key="'elFormItem' + index"
          :label="item.label"
        >
          <el-input
            v-if="item.type === 'input'"
            :disabled="item.disabled"
            v-lsNumber="{value:item.inputType, obj:searchOption.data, key:item.prop}"
            v-model.trim="searchOption.data[item.prop]"
            :placeholder="item.placeholder || '请输入' + item.label"
            clearable
          ></el-input>
          <el-date-picker
            v-if="item.type === 'datePicker'"
            :value-format="item.valueFormat || 'yyyy-MM-dd'"
            v-model="searchOption.data[item.prop]"
            :placeholder="item.placeholder || '请选择' + item.label"
          ></el-date-picker>
          <el-date-picker
            v-if="item.type === 'dateRange'"
            v-model="searchOption.data[item.prop]"
            type="daterange"
            :value-format="item.valueFormat || ''"
            :range-separator="item.rangeSeparator || '-'"
            :start-placeholder="item.startPlaceholder || '开始日期'"
            :end-placeholder="item.endPlaceholder || '结束日期'"
          ></el-date-picker>
          <el-select
            v-if="item.type === 'select' && !item.remote"
            v-model="searchOption.data[item.prop]"
            :placeholder="item.placeholder || '请输入' + item.label"
            :multiple="item.multiple"
            :filterable="item.filterable"
            :disabled="item.disabled"
            collapse-tags
            clearable
          >
            <el-option
              v-for="(op, j) in (item.selectOptions || dictMap[item.propInDict] || dictMap[item.prop])"
              :key="item.prop + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
          <el-select
            v-if="item.type === 'select' && item.remote"
            v-model="searchOption.data[item.prop]"
            :placeholder="'请输入' + item.label"
            filterable
            remote
            clearable
            :multiple="item.multiple"
            :remote-method="(queryString) => {item.remoteMethod && queryString !== '' && item.remoteMethod(queryString, item, searchOption.data)}"
            @visible-change="(value) => {if(value){item.visibleChange && item.visibleChange('', item, searchOption.data)}}"
            @change="(value) => {item.change && item.change(value, item, searchOption.data)}"
            @click.native="remoteClickNative(item)"
          >
            <!-- 部分autocomplete类型更适合用select reomte，原始click事件解决首次点击select列表不触发问题 -->
            <el-option
              v-for="(optionItem, j) in item.remoteSelectList || []"
              :key="'select' + item.prop + optionItem.value + j"
              :label="item.labelDIY ? optionItem[item.labelDIY.label] : optionItem.label"
              :value="optionItem.value"
            >
              <template v-if="item.labelDIY">
                <span>{{optionItem[item.labelDIY.DIY]}}</span>
              </template>
            </el-option>
          </el-select>
          <el-autocomplete
            v-if="item.type === 'autocomplete'"
            v-model="searchOption.data[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder || '请选择' + item.label"
            :select-when-unmatched="true"
            :fetch-suggestions="(queryString, cb) => {item.querySearch && item.querySearch(queryString, cb)}"
            @select="(value) => {item.select && item.select(value)}"
            @change="(value) => {item.change && item.change(value)}"
            @clear="(value) => {if (item.clear) {item.clear(value)} else {clear(item, searchOption)}}"
            clearable
          ></el-autocomplete>
          <el-autocomplete
            v-if="item.type === 'numberRange'"
            v-model="searchOption.data[item.prop]"
            :placeholder="item.placeholder || '请选择' + item.label"
            :select-when-unmatched="true"
            :fetch-suggestions="(queryString, cb) => {item.querySearch && item.querySearch(queryString, cb)}"
            @select="(value) => {item.select && item.select(value)}"
            @change="(value) => {item.change && item.change(value)}"
            clearable
          ></el-autocomplete>
          <el-cascader
            v-if="item.type === 'cascader'"
            filterable
            clearable
            size="mini"
            :options="item.cascaderList"
            v-model="searchOption.data[item.prop]"
            @change="(value) => {item.change && item.change(value)}"
            :props="item.cascaderProps"
            :placeholder="item.placeholder || '请选择' + item.label"
            change-on-select
            expandTrigger="click"
          ></el-cascader>
          <SearchFilter
            v-if="item.type === 'filter'"
            :item="item.item"
            :filterGroups="item.filterGroups"
            :allot-span="item.allotSpan"
          />
          <div v-if="item.type === 'range'" class="range__div">
            <el-input
              v-lsNumber="{value:item.inputType, obj:searchOption.data[item.prop], key:'min'}"
              style="width:82px"
              v-model="searchOption.data[item.prop].min"
              placeholder="最小"
              @change="minChange(searchOption.data[item.prop])"
              clearable
            ></el-input>
            <span style="padding: 0 5px;">-</span>
            <el-input
              v-lsNumber="{value:item.inputType, obj:searchOption.data[item.prop], key:'max'}"
              style="width:82px"
              v-model="searchOption.data[item.prop].max"
              placeholder="最大"
              @change="maxChange(searchOption.data[item.prop])"
              clearable
            ></el-input>
          </div>
        </el-form-item>
        <!-- addFilter 搜索时需单独处理-->
        <!-- searchInputGroup 显示的搜索条件数组 -->
        <!-- allFilterGroups 左侧下拉各数组组成的对象  -->
        <!-- filterGroups 右侧配置组成的对象 -->
        <!-- defaultSearchLength 初始化的搜索条件数量，暂时无用 -->
        <!-- :defaultSearchLength="searchOption.addFilter.defaultSearchLength" -->
        <!-- item 渲染的对象 -->
        <!-- item.isReadOnly 是否是label样式，即非下拉-->
        <!-- item.label isReadOnly为true时渲染此值 -->
        <!-- item.key 左侧下拉选择的值，初始为空  filterGroups[item.key]右侧配置-->
        <!-- item.category allFilterGroups[item.category] 左侧下拉数组 此处不用 -->
        <!-- :allFilterGroups="searchOption.addFilter.allFilterGroups" -->
        <!-- 用法参考 finance/finBill/finBillList/index.vue 搜索TODO -->
        <template v-if="searchOption.addFilter">
          <AddFilter
            class="self-addfilter"
            v-for="(item, index) in searchOption.addFilter.searchInputGroup"
            :key="'filter' + index"
            :searchInputGroup="searchOption.addFilter.searchInputGroup"
            :filterGroups="searchOption.addFilter.filterGroups"
            :item="item"
            :index="index"
            :defaultSearchLength="searchOption.addFilter.defaultSearchLength || 0"
          />
          <div
            v-if="searchOption.addFilter.plusShow !== false"
            class="finance-search-plus"
            @click="handleAddFilter"
          ></div>
          <!-- <div class="btn-plus-search" @click="handleAddFilter"></div> -->
          <!-- <i
          style="font-size:28px;color:#666;cursor:pointer"
          class="el-icon-circle-plus-outline"
          @click="handleAddFilter"
          v-if="searchOption.addFilter.plusShow !== false"
          ></i>-->
        </template>
        <!-- <template v-if="searchOption.originFilters">
        <AddFilter
          class="self-addfilter"
          v-for="(item, index) in searchOption.originFilters.searchInputGroup"
          :key="'filter' + index"
          :searchInputGroup="searchOption.originFilters.searchInputGroup"
          :filterGroups="searchOption.originFilters.filterGroups[index]"
          :item="item"
          :index="index"
          :showClose="false"
        />
        </template>-->
        <div class="search-btns" v-if="!searchOption.hideBtns">
          <el-button type="primary" @click="search('btn')" size="mini">搜索</el-button>
          <el-button @click="cancel" size="mini">重置</el-button>
          <i
            :class="`el-icon-arrow-${templateShow ?'down':'up'}`"
            @click="templateShow=!templateShow"
            v-if="searchOption.saveShow"
          ></i>
        </div>
      </el-form>
    </transition>
    <!-- 搜索模板 -->
    <div class="search-template" v-show="templateShow && searchOption.saveShow">
      <div class="fl template-list">
        <span>选择模板：</span>
        <span
          class="template-li"
          :class="composeKey === item.composeKey ? 'active' : ''"
          v-for="(item, index) in (searchOption.conditions||[]).filter(item=>!['defaultSearchSaveKey', 'searchSaveKey'].includes(item.composeKey)).filter((item, index) => index < 5)"
          :key="'condition' + index"
          @click="handleClickCondition(item, index)"
        >
          {{item.composeKey}}
          <i
            class="el-icon-close"
            @click.stop="handleConditionDelete(item, index)"
          ></i>
        </span>
      </div>
      <div class="fr template-operate">
        <span class="mr10" v-show="(searchOption.conditions||[]).length > 5">
          更多模板
          <el-select
            style="width: 180px !important"
            size="mini"
            v-model="composeKey"
            placeholder="请选择更多模板"
            @change="handleChangeCondition"
          >
            <el-option
              v-for="(item, index) in (searchOption.conditions||[]).filter(item=>!['defaultSearchSaveKey', 'searchSaveKey'].includes(item.composeKey))"
              :label="item.composeKey"
              :value="item.composeKey"
              :key="'composeKey' + index"
            >
              <span style="float: left">{{item.composeKey}}</span>
              <i
                class="el-icon-close"
                style="float: right; color: #8492a6; font-size: 12px; line-height: 28px"
                @click.stop="handleConditionDelete(item, index)"
              ></i>
            </el-option>
          </el-select>
        </span>

        <!-- 显示清空即可，隐藏清空时会引起请求接口时获取不到值 -->
        <!-- @after-leave="newComposeKey = ''" -->
        <el-popover
          popper-class="search-template-popover"
          placement="bottom"
          width="240"
          v-model="popoverShow"
          @show="newComposeKey = ''"
        >
          <div class="flex">
            <span class="span-text">模板名称</span>
            <el-input
              type="text"
              size="mini"
              maxlength="32"
              show-word-limit
              v-model="newComposeKey"
              placeholder="请输入模板名称"
              class="temp-input"
              style="width: 164px"
            ></el-input>
          </div>
          <div style="text-align: right; margin: 8px 0 0">
            <el-button size="mini" type="default" @click="popoverShow=false" class="ui-mini-btn">取消</el-button>
            <el-button
              type="primary"
              size="mini"
              @click="handleSaveAsTemplate"
              class="ui-mini-btn"
            >确定</el-button>
          </div>
          <el-button
            type="text"
            size="mini"
            slot="reference"
          >{{(searchOption.conditions||[]).length && composeKey ? '另存为' : '保存'}}</el-button>
        </el-popover>
        <el-button
          type="text"
          size="mini"
          @click="handleSaveTemplate"
          v-show="(searchOption.conditions||[]).length && composeKey"
        >保存</el-button>
      </div>
    </div>
    <div class="search-fieldValue-cont" v-if="searchOption.contentShow">
      <div class="label">查询条件：</div>
      <div class="filedValue-list" v-for="item in (searchValueGroup||[])" :key="item.key">
        <el-tooltip placement="bottom" effect="dark" :content="item.value+''">
          <div class="value">{{item.label}}: {{item.value}}</div>
        </el-tooltip>
        <i class="el-icon-close filter-close" @click="handleDeleteFiledValue(item)"></i>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import SearchFilter from './searchFilter'
import AddFilter from './addFilter'
import { searchConditionInfo, searchConditionSave, searchConditionDelete } from '@/api/base'
import { truckLoadDelete } from '@/api/order/shippingTruck'
export default {
  components: {
    SearchFilter,
    AddFilter,
  },
  props: {
    searchOption: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      templateShow: true, // 模板显示
      composeKey: '', // 模板名称
      popoverShow: false, //
      newComposeKey: '', // 新模板名称
      activeGetSearchKey: false, // 搜索需要保存时， 是否已经获取到数据
      isProcessed: false, // 是否进行过搜索的处理
    }
  },
  // created() {
  //   // if (this.searchOption.saveDefault || this.searchOption.saveShow) {
  //   //   this.backupSearchInputGroup = [...this.searchOption.addFilter.searchInputGroup]
  //   //   this.searchOption.addFilter.searchInputGroup.splice(0, 1000)
  //   // }
  // },
  mounted() {
    // 有的tab页面未使用keepalive，不能进入activated，延迟判断isNotFirstActivated，如果为true则不再此处执行搜索
    setTimeout(() => {
      if (this.isNotFirstActivated) return
      ;(this.searchOption.saveShow || this.searchOption.saveDefault) && this.searchConditionInfo()
      setTimeout(() => {
        this.isProcessed = true
      }, 600)
    }, 100)
  },
  methods: {
    addFilterSearch() {
      // crm 搜索条件，统一
      let option = this.searchOption.addFilter
      let dateArr = option.dateArr || []
      let query = []
      option.searchInputGroup.forEach(({ key: column, value }) => {
        if (!value) return
        let sType = option.filterGroups[column].type
        let queryType = option.filterGroups[column].queryType || '' //搜索type
        if (dateArr.indexOf(column) > -1) {
          // 拜访计划年月 planMonth 较特殊，不需要日，时分秒
          query.push({ column, type: 'ge', value: value[0] + (column == 'planMonth' ? '' : ' 00:00:00') })
          query.push({ column, type: 'le', value: value[1] + (column == 'planMonth' ? '' : ' 23:59:59') })
        } else if (value instanceof Array) {
          if (column === 'deptCode') return value.length && query.push({ column, type: 'in', value })
          value.length && query.push({ column, type: 'in', value: value.join(',') })
        } else if (column == 'indexAddr') {
          query.push({ column: 'province', type: 'like', value })
        } else if (['select', 'remoteSelect'].includes(sType)) {
          query.push({ column, type: 'eq', value })
        } else if (column == 'socialStaffNum') {
          query.push({ column, type: 'eq', value })
        } else {
          query.push({ column, type: queryType || 'like', value })
        }
      })
      return query
    },
    search(nosave) {
      for (let key in this.searchOption.data) {
        let value = this.searchOption.data[key]
        if (typeof value === 'string') {
          this.searchOption.data[key] = value.trim()
          //判断null，修复日期搜索项有bug
        } else if (typeof value === 'object' && value !== null) {
          let subValue = value.value
          if (typeof subValue === 'string') {
            value.value = subValue.trim()
          }
        }
      }
      if (this.searchOption.addFilter && this.searchOption.addFilter.searchInputGroup) {
        this.searchOption.addFilter.searchInputGroup.forEach((item) => {
          if (item.value && typeof item.value === 'string') {
            item.value = item.value.trim()
          }
          if (item.range && (item.range.min !== '' || item.range.max !== '')) {
            item.range.min = item.range.min && item.range.min.trim()
            item.range.max = item.range.max && item.range.max.trim()
          }
        })
      }
      if (nosave !== 'nosave' && this.searchOption.addFilter && (this.searchOption.saveDefault || this.searchOption.saveShow)) {
        console.log('```````search searchConditionSave')
        this.searchConditionSave(nosave === 'btn' ? 'defaultSearchSaveKey' : this.composeKey || 'defaultSearchSaveKey')
      }
      let listHeightFunc = this.searchOption.listHeightFunc
      if (listHeightFunc) {
        listHeightFunc() // 上一级调用处已加nextTick
      }
      if (this.searchOption.addFilter && this.searchOption.addFilter.callback) {
        return this.$emit('search', this.addFilterSearch())
      }

      if (!this.isProcessed && this.searchOption.isNotAutoLoad && !this.$route.query.tabFromOther) {
      } else {
        this.$emit('search', this.searchOption.data)
      }
    },
    cancel() {
      let filters = this.searchOption.addFilter
      if (filters) {
        // if (filters.defaultSearchLength) {
        //   filters.searchInputGroup.splice(filters.defaultSearchLength, 1000)
        // }
        filters.searchInputGroup.forEach((item) => {
          if (item.saveList) item.saveList = []
          item.value = item.req = item.valueReq = item.columnReq = ''
          if (item.range) {
            item.range.min = item.range.max = ''
          }
        })
      }
      let keys = Object.keys(this.searchOption.data || {})
      let columns = this.searchOption.columns || []
      console.log('清空前:', this.searchOption.data)
      keys.forEach((key) => {
        let column = columns.find(item => item.prop === key) || {}
        if (key[0] === '_') {
          // 键名首位是“_”表示filter组件（多级下拉），键对应的值是对象{key:'',value:''}
          let filter = this.searchOption.data[key]
          // if (filter.key || filter.value) {
          //   filter.key = filter.value = ''
          if (filter.value) {
            filter.value = ''
          }
        } else if (key[0] === 'R' || column.type === 'range') {
          // 键名首位是“R”表示有最大最小区间，键对应的值是对象{min:'',max:''}
          let range = this.searchOption.data[key]
          range.min = range.max = ''
        } else {
          this.searchOption.data[key] = ''
        }
      })
      console.log('清空后:', this.searchOption.data)
      // this.searchOption.callback && this.searchOption.callback()
      // 设置选择的模板未空
      this.composeKey = ''
      // 全量搜索太耗性能，改为重置只清空条件，不进行搜索
      // if (this.searchOption.addFilter && this.searchOption.addFilter.callback) {
      //   return this.$emit('search', [], true)
      // }
      // 重置时保存搜索条件，直接走搜索流程就可以
      // this.search('btn')
      // this.$emit('search', this.searchOption.data, true)
      this.$emit('cancel')
    },
    clear(item, searchOption) {
      let propCode = item.prop.replace('Name', 'Code')
      searchOption.data[propCode] = ''
    },
    minChange(item) {
      console.log(item);
      let { min, max } = item
      if (min !== '' && max !== '' && min - max >= 0) {
        this.$message({
          message: '最小值不能大于最大值',
          type: 'warning',
          showClose: true,
        })
        item.min = ''
      }
    },
    maxChange(item) {
      let { min, max } = item
      if (min !== '' && max !== '' && min - max >= 0) {
        this.$message({
          message: '最大值不能小于最小值',
          type: 'warning',
          showClose: true,
        })
        item.max = ''
      }
    },
    // 增加一条搜索条件
    handleAddFilter(unshift, key) {
      this.searchOption.addFilter.searchInputGroup.push({ key: '', value: '', range: { min: '', max: '' } })
      // console.log('新增一条：', this.searchOption.addFilter.searchInputGroup)
    },
    remoteClickNative(item) {
      if (item.remote && item.remoteMethod && !item.notFirst) {
        item.notFirst = true
        item.remoteMethod('', item)
      }
    },
    // 搜索保存 只保存搜索项 ，不保存值    20211221废弃，所有都要保存值
    searchConditionSaveKey() {
      let searchConfigList = this.searchOption.addFilter.searchInputGroup
        .filter((v) => v.key)
        .map((item) => {
          return {
            searchField: item.key,
            searchValue: JSON.stringify({ key: item.key, value: '', range: { min: '', max: '' } }),
          }
        })
      // 无搜索条件时保存会报错，跳过调用接口，已改为至少一个搜索条件，此做法是兼容旧数据
      if (!searchConfigList.length) {
        return
      }

      // 搜索按钮保存时，保存在本地，并设置最后一次搜索值为true
      let _searchInfoLocal = JSON.parse(localStorage.getItem('_searchInfoLocal') || '{}')
      _searchInfoLocal[this.searchOption.saveName || this.$route.name] = {
        composeKey: 'defaultSearchSaveKey',
        isLast: true,
        searchItemList: searchConfigList.map((item) => item.searchField),
      }
      localStorage.setItem('_searchInfoLocal', JSON.stringify(_searchInfoLocal))

      // searchConditionSave({
      //   scenesCode: this.searchOption.saveName || this.$route.name,
      //   composeKey: 'defaultSearchSaveKey',
      //   searchConfigList,
      // }).then(() => {
      this.composeKey = ''
      if (this.searchOption.conditions && this.searchOption.conditions[0]) {
        let find = this.searchOption.conditions.find((item) => item.composeKey === 'defaultSearchSaveKey')
        if (find) {
          find.searchItemList = searchConfigList
        }
      } else {
        this.searchOption.conditions = [{ composeKey: 'defaultSearchSaveKey', searchItemList: searchConfigList }]
      }
      // })
    },
    /************************************* 搜索条件保存功能-begin *************************************/
    // 保存
    handleSaveTemplate() {
      this.$confirmWarn('是否保存该条模板?', () => {
        this.searchConditionSave()
      })
    },
    // 另存搜索模板
    handleSaveAsTemplate() {
      // console.log(this.searchOption.conditions.map(v => v.composeKey), this.composeKey, this.newComposeKey)
      if (!this.newComposeKey && !this.composeKey) return this.$msgErrClose('请输入模板名称')
      if (this.searchOption.conditions.find((v) => v.composeKey.trim() == this.newComposeKey.trim())) {
        this.popoverShow = false
        return this.$confirmWarn('已存在该名称的模板，是否覆盖?', () => {
          this.searchConditionSave()
        })
      }
      this.popoverShow = false
      this.searchConditionSave()
    },
    // 点击选择模板按钮
    handleClickCondition(item, index) {
      this.composeKey = item.composeKey
      this.setSearchInfo(item.searchItemList)
    },
    // 选择下拉更多模板
    handleChangeCondition(val) {
      if (val) {
        let findItem = (this.searchOption.conditions || []).find((item) => item.composeKey === val)
        this.composeKey = findItem.composeKey
        this.setSearchInfo(findItem.searchItemList)
      }
    },
    // 保存
    searchConditionSave(composeKey) {
      let reqComposeKey = (composeKey || this.newComposeKey || this.composeKey).trim()
      if (reqComposeKey === 'defaultSearchSaveKey') {
        this.searchConditionSaveKey()
        return
      }

      // 不是搜索按钮时，将本地记录的最后一次搜索值设为false
      let _searchInfoLocal = JSON.parse(localStorage.getItem('_searchInfoLocal') || '{}')
      let curSearch = _searchInfoLocal[this.searchOption.saveName || this.$route.name]
      if (curSearch && curSearch.isLast) {
        curSearch.isLast = false
        localStorage.setItem('_searchInfoLocal', JSON.stringify(_searchInfoLocal))
      }

      let searchConfigList = []
      if (this.searchOption.data) {
        searchConfigList.push({ searchField: 'search_data', searchValue: JSON.stringify(this.searchOption.data) })
      }
      if (this.searchOption.addFilter && this.searchOption.addFilter.searchInputGroup) {
        searchConfigList = this.searchOption.addFilter.searchInputGroup.map((item) => {
          return {
            searchField: item.key,
            searchValue: JSON.stringify(item),
          }
        })
      }
      // 无搜索条件时保存会报错，跳过调用接口，已改为至少一个搜索条件，此做法是兼容旧数据
      if (!searchConfigList.length) {
        return this.searchConditionInfo()
      }
      searchConditionSave({
        scenesCode: this.searchOption.saveName || this.$route.name,
        composeKey: reqComposeKey,
        searchConfigList,
      }).then((res) => {
        this.composeKey = ['defaultSearchSaveKey', 'searchSaveKey'].includes(reqComposeKey) ? '' : reqComposeKey
        if (!composeKey) {
          this.$msgSucClose('保存成功！')
          return this.searchConditionInfo()
        }
      })
    },
    // 删除搜索模板
    handleConditionDelete(item, index) {
      this.$confirmWarn(`是否删除‘${item.composeKey}’该条模板?`, () => {
        searchConditionDelete({
          scenesCode: this.searchOption.saveName || this.$route.name,
          composeKey: item.composeKey,
        }).then((res) => {
          this.$msgSucClose('删除成功！')
          if (item.composeKey == this.composeKey) {
            // 所删除是当前选中的搜索模板，则重新获取所有模板
            this.searchConditionInfo()
          } else {
            // 所删除不是当前选中的搜索模板，则直接删除
            index = this.searchOption.conditions.findIndex(({ composeKey }) => composeKey === item.composeKey)
            this.searchOption.conditions.splice(index, 1)
          }
        })
      })
    },
    // 获取信息
    searchConditionInfo(isFromQuery) {
      searchConditionInfo({ scenesCode: this.searchOption.saveName || this.$route.name }).then((res) => {
        let list = res.data?.customConfigList || []
        // 获取远程保存条件信息后，再读取本地保存的记录，判断本地记录，如果是最后一次搜索，则将本记录插入到返回数据的头部
        let _searchInfoLocal = JSON.parse(localStorage.getItem('_searchInfoLocal') || '{}')
        let curSearch = _searchInfoLocal[this.searchOption.saveName || this.$route.name]
        if (curSearch && curSearch.isLast && isFromQuery !== true) {
          curSearch.searchItemList = curSearch.searchItemList.map((key) => {
            key = typeof key === 'string' ? key : key.searchField
            return {
              searchField: key,
              searchValue: JSON.stringify({ key, value: '', range: { min: '', max: '' } }),
            }
          })
          list.unshift(curSearch)
        }
        // 过滤掉默认保存时的脏数据     20211221修改为：不过滤，而是显示时隐藏
        // if (this.searchOption.saveShow) {
        //   list = list.filter((item) => !['defaultSearchSaveKey', 'searchSaveKey'].includes(item.composeKey))
        // }
        this.$set(this.searchOption, 'conditions', list)
        if (this.searchOption.conditions.length) {
          let composeKey = this.searchOption.conditions[0].composeKey
          this.composeKey = ['defaultSearchSaveKey', 'searchSaveKey'].includes(composeKey) ? '' : composeKey
          this.setSearchInfo(this.searchOption.conditions[0].searchItemList, 'nosave', isFromQuery)
        } else {
          this.setSearchInfo('', 'nosave', isFromQuery)
        }
      })
    },
    // 设置搜索模板的内容到搜索条件内
    setSearchInfo(searchItemList, nosave, isFromQuery) {
      if (searchItemList && searchItemList.length) {
        console.log(searchItemList)
        let customConfigData = {}
        // 当searchItemList[0].searchField === 'search_data'，表示是老的搜索组件，左侧不是下拉选择
        if ((this.searchOption.saveShow || this.searchOption.saveDefault) && searchItemList[0].searchField === 'search_data') {
          searchItemList.forEach((item) => {
            customConfigData[item.searchField] = JSON.parse(item.searchValue)
          })
        } else {
          customConfigData.searchInputGroup = []
          searchItemList.forEach((item) => {
            customConfigData.searchInputGroup.push(JSON.parse(item.searchValue))
          })
        }
        // 新搜索组件-下拉选择
        if (customConfigData.searchInputGroup) {
          let obj = {}
          // 先设置搜索条件
          let filterGroups = this.searchOption.addFilter.filterGroups
          // if (!customConfigData.searchInputGroup.length) {
          //   customConfigData.searchInputGroup = this.backupSearchInputGroup
          // }
          this.searchOption.addFilter.searchInputGroup = customConfigData.searchInputGroup
            .map((item) => {
              if (!filterGroups[item.key]) return undefined
              obj[item.key] = { value: item.value, range: { ...item.range } }
              if (item.saveList && filterGroups[item.key].remoteSelectList) {
                filterGroups[item.key].remoteSelectList.splice(0, 1000, ...item.saveList)
              }
              return { ...item, value: '' }
            })
            .filter((v) => v)
          // 延迟设置搜索条件的值，防止addFilter组件内监听key值，清空搜索条件的值
          return this.$nextTick(() => {
            if (isFromQuery === true) {
              return this.tabFromOtherSearch()
            }
            this.searchOption.addFilter.searchInputGroup.forEach((item) => {
              if (!this.composeKey) {
                item.value = ''
                item.range = { min: '', max: '' }
              } else {
                item.value = obj[item.key] && obj[item.key].value
                item.range = obj[item.key] && obj[item.key].range
              }
            })
            // 此处触发搜索，在外部触发可能出现搜索时间早于此处赋值时间
            this.$nextTick(() => {
              this.activeGetSearchKey = true
              this.search(nosave)
            })
          })
        }
        // console.log(customConfigData.searchInputGroup);
        // 旧搜索组件-固定字段：值
        if (customConfigData.data) {
          this.searchOption.data = customConfigData.data
        }
      }

      this.$nextTick(() => {
        this.activeGetSearchKey = true
        if (isFromQuery === true) {
          return this.tabFromOtherSearch()
        }
        this.search(nosave)
      })
      // if (this.__searchTime) clearTimeout(this.__searchTime)
      // this.__searchTime = setTimeout(() => {
      //   this.__searchTime = null
      // this.search()
      // }, 800)
    },
    /************************************* 搜索条件保存功能-end *************************************/
    // 从链接打开页面，处理链接带入的参数
    tabFromOtherSearch() {
      let query = this.$route.query
      let filterGroups = this.searchOption.addFilter.filterGroups
      let searchInputGroup = this.searchOption.addFilter.searchInputGroup
      for (const key in query) {
        if (filterGroups[key]) {
          let find = searchInputGroup.find((item) => item.key === key)
          let value = filterGroups[key].multiple ? typeof query[key] === 'object' ? query[key] : [query[key]] : query[key]
          if (find) {
            find.value = value
          } else {
            searchInputGroup.push({ key, value, range: { min: '', max: '' } })
          }
        }
      }
      this.search('btn')
      this.$router.replace({ name: this.$route.name })
    },
    // 清除搜索条件
    handleDeleteFiledValue(item) {
      this.searchOption.addFilter.searchInputGroup.map((ele) => {
        if (ele.key === item.key) {
          ele.value = ''
        }
        return { ...ele }
      })
      this.$set(this.searchOption.addFilter.filterGroups[item.key], 'saveList', [])
      // this.callbackAction('DeleteFieldVal', item)
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
    searchValueGroup() {
      let option = this.searchOption.addFilter
      let query = []
      let filterGroups = this.searchOption.addFilter.filterGroups
      option.searchInputGroup.forEach((item) => {
        const { key, value, range, valueReq } = item
        let filterObj = filterGroups[key]
        if (!filterObj) return
        // :key="key"  <div class="value">{{item.label}}: {{item.fieldValue}}</div>
        const { label, type, cascaderList, cascaderProps, remoteSelectList, selectOptions, prop, multiple } = filterObj
        if (range && (range.min || range.max)) {
          return query.push({ key, label, value: `${range.min || 0}~${range.max || '-'}` })
        }
        if (valueReq && item[valueReq]) {
          return query.push({ key, label, value: item[valueReq] })
        }
        if (!value) return
        if (['select', 'remoteSelect'].includes(type)) {
          let list = remoteSelectList || selectOptions || this.dictMap[prop]
          // console.log(list, value)
          let backupVal
          if (multiple) {
            if (!value.length) return
            backupVal = value.map((item) => list.find((v) => v.value === item)?.label).join(',')
          } else {
            backupVal = list.find((v) => v.value === item.value)?.label
          }
          return query.push({ key, label, value: backupVal })
        }
        if (value instanceof Array) {
          if (value.length === 0) return
          let bakupVal = [...value]
          if (['cascader', 'lsCascader', 'diyCascader'].includes(type)) {
            let { value: code, label: name, children } = cascaderProps
            let result = []
            function getLabel(arr, code) {
              if (!arr) return
              let find = arr.find((item) => item[code] === bakupVal[0])
              if (find) {
                result.push(find)
                bakupVal.shift()
                bakupVal.length && getLabel(find[children], code)
              }
            }
            getLabel(cascaderList, code)
            // console.log(result, value)
            return query.push({ key, label, value: result.map((v) => v[name]).join('/') })
          } else if (['datetimerange', 'daterange', 'lsDaterange'].includes(type)) {
            return query.push({ key, label, value: `${value[0] || '-'}~${value[1] || '-'}` })
          } else {
            return query.push({ key, label, value: value.join(',') })
          }
        } else {
          query.push({ key, label, value })
        }
      })
      // console.log(query)
      return query
    },
  },
  activated() {
    if (!this.isNotFirstActivated) {
      this.isNotFirstActivated = true
      // if (this.$route.query.tabFromOther) {
      //   this.tabFromOtherSearch()
      // }
      // // else
      if (this.searchOption.saveShow || this.searchOption.saveDefault) {
        this.searchConditionInfo(!!this.$route.query.tabFromOther)
        setTimeout(() => {
          this.isProcessed = true
        }, 600)
      } else if (this.$route.query.tabFromOther) {
        this.tabFromOtherSearch()
      }
    } else if (this.$route.query.tabFromOther) {
      this.tabFromOtherSearch()
    }
  },
}
</script>
<style lang="scss" scoped>
// 搜索组件与table组件之间的间隙，省去手动添加div
.finance-search-form.borderBottom {
  border-bottom: 8px solid #f8f9fd;
}
// 针对弹框内的搜索组件，label不设宽度
.finance-search-form.noLabelWidth ::v-deep {
  .el-form-item {
    width: auto;
    & > label {
      width: auto;
      flex: 0 0 auto;
    }
  }
  .el-form-item__content {
    max-width: 178px;
  }
}
.finance-search-form ::v-deep {
  .el-range-editor.el-input__inner {
    padding-left: 6px;
    padding-right: 0;
  }
}
.finance-search-form ::v-deep {
  .el-select.el-select--mini,
  .el-cascader--mini,
  .el-date-editor--daterange.el-input__inner {
    width: 100% !important;
  }
  .el-date-editor--date {
    width: 100% !important;
  }
  .el-select.el-select--mini .el-input__suffix {
    right: 3px;
  }
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: auto !important;
  }
  .el-date-editor--daterange.el-range-editor--mini,
  .el-date-editor--monthrange.el-range-editor--mini,
  .el-date-editor--datetimerange.el-range-editor--mini {
    padding-right: 0;
    & > i {
      line-height: 20px !important;
    }
    .el-range-input {
      width: 40%;
    }
  }
  // .search-filter,
  .el-form-item {
    margin: 0 12px 4px 0 !important;
    vertical-align: top;
    width: 287px;
    display: inline-flex;
    align-items: center;
  }
  .el-form-item {
    & > label {
      width: 106px;
      flex: 0 0 auto;
    }
    .el-form-item__content {
      flex: 1 1 auto;
      & > div {
        width: 100%;
        overflow: hidden;
      }
    }
  }
  .el-input__inner {
    padding-right: 20px;
  }
  .el-input__suffix {
    right: 0;
  }
  .el-form-item__content {
    line-height: 20px !important;
    height: 20px !important;
  }
}
/* 清除浮动 */
.el-form {
  display: inline-block;
  width: 100%;
}
// .finance-search-form .el-form-item,
// .finance-search-form .self-addfilter {
//   margin: 0 24px 10px 0 !important;
//   vertical-align: top;
// }
// .finance-search-form .el-date-editor.el-input {
//   width: 162px;
// }
// .finance-search-form .el-select {
//   width: 162px;
// }
// .finance-search-form .el-cascader {
//   width: 220px;
// }
// .finance-search-form .el-input {
//   width: 162px;
// }
// .finance-search-form .el-date-editor--daterange.el-input__inner {
//   width: 220px;
// }
.btn-plus-search {
  cursor: pointer;
}
.self-addfilter {
  display: inline-flex;
}
.finance-search-form ::v-deep .el-range-separator {
  padding: 0 4px !important;
  line-height: 16px !important;
}
// 搜索按钮区域
.search-btns {
  float: right;
  margin-right: 0 !important;
  margin-bottom: 8px;
  & > i {
    cursor: pointer;
    font-size: 12px;
    height: 22px;
    line-height: 22px;
    margin-left: 8px;
  }
}
// 搜索条件保存功能
.search-template {
  border-top: 1px solid #e9e9e9;
  padding: 4px 8px;
  width: 100%;
  overflow: hidden;
  .el-input__inner {
    // border: 0;
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    padding-right: 25px;
    &.el-date-editor--daterange {
      padding-right: 0;
    }
  }
  .el-input--mini .el-input__icon {
    line-height: 20px;
  }
  .el-range-editor.el-input__inner {
    padding: 0px 5px;
  }
  .el-input__icon.el-range__icon.el-icon-date {
    float: right;
    -webkit-box-ordinal-group: 2;
    -ms-flex-order: 1;
    order: 1;
    margin-left: 0;
  }
  .el-button--mini {
    height: 20px;
    padding: 2px 8px;
  }
  .el-button--text {
    height: 20px;
    padding: 2px 4px;
  }
  .el-button--text + .el-button--text {
    margin-left: 0;
  }
  .template-list {
    float: left;
    line-height: 20px;
    height: 20px;
    .template-li {
      position: relative;
      cursor: pointer;
      display: inline-block;
      height: 20px;
      line-height: 18px;
      padding: 0 4px;
      border-radius: 2px;
      border: 1px solid #d9d9d9;
      margin-right: 4px;
      min-width: 60px;
      padding-right: 20px;
      .el-icon-close {
        position: absolute;
        top: 4px;
        right: 5px;
      }
      &.active {
        border: 1px solid #3e80f5;
        color: #3e80f5;
        .el-icon-close {
          color: #3e80f5;
        }
      }
    }
  }
  .template-operate {
    float: right;
    .icon-template-delete {
      float: right;
      color: #8492a6;
      font-size: 12px;
      line-height: 28px;
    }
  }
}
.ls-fade-enter-active {
  transition: all 0.3s ease;
}
.ls-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.ls-fade-enter,
.ls-fade-leave-to {
  opacity: 0;
}
.search-fieldValue-cont {
  overflow: hidden;
  padding: 0 8px 4px 8px;
  margin-top: -4px;
  .label {
    float: left;
    display: inline-block;
    width: 60px;
    line-height: 20px;
    height: 20px;
    margin-top: 4px;
  }
  .filedValue-list {
    display: flex;
    flex-wrap: nowrap;
    float: left;
    padding: 0 4px;
    line-height: 20px;
    height: 20px;
    background-color: #c6e2ff;
    margin-right: 10px;
    cursor: pointer;
    margin-top: 4px;
    border-radius: 2px;
    color: #1890ff;
    .value {
      display: inline-block;
      max-width: 200px;
      height: 20px;
      line-height: 20px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .el-icon-close {
      line-height: 21px;
    }
  }
}
</style>
<style>
/* .finance-search-form .multi-select-tag .el-autocomplete .el-input {
  width: 188px;
}
.finance-search-form .multi-select-tag .el-select__tags {
  max-width: 188px !important;
} */
/* .finance-search-form .multi-select-tag .el-select .el-select__tags span .el-tag--mini {
  width: 44px;
} */
.finance-search-form .multi-select-tag .el-select .el-tag__close.el-icon-close {
  right: -1px;
}
</style>
