<template>
  <div class="filter-container search-layout">
    <div class="filter">
      <search-filter v-for="(item, index) in config" 
        :key="index" :item="item" :tableQuery.sync="tableQuery"
        :callback="handleBtn">
      </search-filter>
      <!-- 插槽需要自行处理tableQuery-->
      <slot/>
      <search-btn :callback="handleBtn" :searchTemplateShow="searchTemplateShow" :searchConditionHide="searchConditionHide"></search-btn>
      <!-- <el-button type="text" @click="handleChangeTemplateShow" v-show="!searchConditionHide">
        模板
        <i class="search-template-contral" :class="searchTemplateShow ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
      </el-button> -->
    </div>
    <!-- 搜索模板 -->
    <div class="search-template" v-show="searchTemplateShow && !searchConditionHide">
      <div class="template-list" v-if="searchConditionList.length">
        <span class="label">选择模板：</span>
        <span class="template-li" 
          :class="templateName === item.composeKey ? 'active' : ''"
          v-for="(item, index) in searchConditionList.filter((item, index) => index < 5)" 
          :key="'condition' + index"
          @click="handleClickCondition(item, index)"
        >
          <el-tooltip placement="bottom" effect="dark" :content="item.composeKey">
            <span>{{item.composeKey}}</span>
          </el-tooltip>
          <i class="el-icon-close" @click.stop="handleConditionDelete(item)"></i>
        </span>
      </div>
      <div class="template-operate">
        <span class="mr10" v-show="searchConditionList.length > 5">
          更多模板
          <el-select size="mini" v-model="templateName" placeholder="请选择更多模板" @change="handleChangeCondition">
            <el-option :label="item.composeKey" :value="item.composeKey" v-for="(item, index) in searchConditionList" :key="'composeKey' + index">
              <span style="float: left">{{item.composeKey}}</span>
              <i class="el-icon-close" style="float: right; color: #8492a6; font-size: 12px; line-height: 28px" @click.stop="handleConditionDelete(item)"></i>
            </el-option>
          </el-select>
        </span>
        <el-popover
          popper-class="search-template-popover"
          placement="bottom"
          width="240"
          v-model="visible"
          @show="showPopver">
          <div class="flex">
            <span class="span-text">模板名称</span>
            <el-input type="text" size="mini" maxlength="32" show-word-limit v-model="composeKey" placeholder="请输入模板名称" class="temp-input" style="width: 164px">
            </el-input>
          </div>
          <div style="text-align: right; margin: 8px 0 0">
            <el-button size="mini" type="default" @click="handleCancel" class="ui-mini-btn">取消</el-button>
            <el-button type="primary" size="mini" @click="handleSaveAsTemplate" class="ui-mini-btn">确定</el-button>
          </div>
          <el-button type="text" size="mini" slot="reference">{{!searchConditionList.length ? '保存' : '另存为'}}</el-button>
        </el-popover>
        <el-button type="text" size="mini" @click="handleSaveTemplate" v-show="searchConditionList.length">保存</el-button>
      </div>
    </div>
    <div class="search-fieldValue-cont" v-if="searchValueGroup.length">
      <div class="label">查询条件：</div>
      <div class="filedValue-list" v-for="item in searchValueGroup" :key="item.key">
        <el-tooltip placement="bottom" effect="dark" :content="item.fieldValue">
          <div slot="content">
            <div v-for="(el,index) in item.fieldValue.split(';')" :key="index">{{el}}</div>
          </div>
          <div class="value">
            {{item.label}}: {{maptext(item)}}
          </div>
        </el-tooltip>
        <i class="el-icon-close filter-close" @click="handleDeleteFiledValue(item)" v-if="!isOrderCreatedTime(item)"></i>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import store from '@/store'
import {mapState} from 'vuex'
// import Config from '@/components/Base/config';
import SearchFilter from './filter';
import SearchBtn from './btn';
import { formatDate } from '@/utils/index'
import { searchConditionInfo, searchConditionSave, searchConditionDelete } from '@/api/base'
let defaulTime = []
const end = new Date()
const start = new Date()
start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
defaulTime[0] = formatDate(start)
defaulTime[1] = formatDate(end)
export default {
  name: 'search',
  data() {
    return {
      configFlag: false,  // 防止无限watch
      // Config: Config,
      searchConditionList: [],  // 自定义搜索模板集合
      templateName: '',   // 模板名称
      resDefaConfList: [], // 后端配置的默认搜索模板
      // templateNameTag: '',  // 选择模板tag
      searchTemplateShow: false, // 搜索模板默认显示
      composeKey: '', // 搜索组合KEY
      visible: false,
      roleSwitchRouters: ['OrderList', 'AirTransportOrderList'],
      tableQueryForm: this.tableQuery,
      notShowCreateTimeParamList: ['universalNo', 'orderNo', 'jointNo', 'blNo', 'so', 'hbl', 'mawb', 'hawb', 'custid', 'mainCompDeptCode'], // 搜索条件有这些字段时不展示订单创建时间选择框
    }
  },
  components: {
    SearchFilter,
    SearchBtn
  },
  props: {
    // 搜索参数
    config: {
      type: Array,
      default: () => ([])
    },
    // searchConditionConfig: {
    //   type: Array,
    //   default: () => ([])
    // },
    // 接口传参
    tableQuery: {
      type: Object,
      default: () => ({})
    },
    // 事件回调{一系列的操作动作}
    callback: {
      type: Function,
      default: () => ({})
    },
    searchConditionHide: {
      type: Boolean,
      default: false
    },
    searchFiledGroup: {
      type: Array,
      default: () => ([])
    },
    filterGroups: {
      type: Object,
      default: () => ({})
    },
    fixedCreatedTime: {
			type: Boolean,
			default: false
		}
  },
  created() {
    this.configFlag = !!this.config.length;
    // console.log('searchConditionList', this.searchConditionList)
    this.getSearchConditionInfo(false, true)
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      currRole: state => state.user.currRole,
    }),
    searchValueGroup() {
      let result = []
      result = this.searchFiledGroup.filter(item => item.value && (''+item.value)).map(item => {
        let searchItemObj = this.filterGroups[item.key]
        let dictKey = searchItemObj.propInDict || item.key
        item.label = searchItemObj.label
        item.fieldValue = item.value
        // if (['input', 'textarea', 'date'].includes(searchItemObj.type)) {
        //   item.fieldValue = item.value
        // }
        // 时间区间组件
        if (searchItemObj.category === 'daterange' || searchItemObj.category === 'datetimerange' ) {
          item.fieldValue = item.value ? item.value.toString() : ''
        }
        if (searchItemObj.category === 'numberRange') {
          item.fieldValue = item.value ? item.value.toString() : ''
        }
        // 普通下拉组件，远程搜索下拉组件
        if (['select', 'remoteSelect'].includes(searchItemObj.type)) {
          // 下拉多选的label值从saveList里取，搜索组件参数配置时需要在filterGroups的多选下拉组件的change事件中设置saveList的值
          if (searchItemObj.multiple) {
            // console.log('searchItemObj.saveList', searchItemObj.saveList)
            let filterArr = searchItemObj.saveList.filter(ele => ele.value && item.value.includes(ele.value)).map(ele => ele.label)
            filterArr = new Set(filterArr)
            filterArr = Array.from(filterArr)
            // console.log('filterArr', filterArr)
            item.fieldValue = filterArr.toString()
          }
          // 下拉列表数组用的是前端定义的或是请求接口返回的data的处理
          else if (searchItemObj.data && searchItemObj.data.length) {
            let findItem = searchItemObj.data.find(ele => ele.value === item.value)
            item.fieldValue = searchItemObj.text ? searchItemObj.text : findItem ? findItem.label : ''
          }
          // 下拉列表数组用的是字典的处理
          else if (searchItemObj.type === 'select' && (this.dictMap[item.key] || this.dictMap[searchItemObj.propInDict])) {
            let dictItem = this.dictMap[dictKey]
            let findItem = dictItem.find(ele => ele.value === item.value)
            item.fieldValue = findItem ? findItem.label : ''
          }
        }
        // cascader组件
        if (searchItemObj.type === 'cascader') {
          if(!searchItemObj.cascaderProps.multiple){
            let filterArr = searchItemObj.saveList.filter(ele => ele.value && item.value.includes(ele.value)).map(ele => ele.label)
            filterArr = new Set(filterArr)
            filterArr = Array.from(filterArr)
            item.fieldValue = filterArr.join('/')
          }else{
            // 多选
            if(searchItemObj.saveList && searchItemObj.saveList.length){
              let arr=[]
              for(let i=0;i<searchItemObj.saveList.length;i++){
                let filterArr = searchItemObj.saveList[i].map(ele => ele.label)
                arr.push(filterArr.join('/'))
              }
              item.fieldValue = arr.join(';')
            }
          }
        }
        return {...item}
      })
      if (this.fixedCreatedTime) {
        let ind = this.searchFiledGroup.findIndex(item => item.key === 'createdTime')
        if (result.some(item => this.notShowCreateTimeParamList.includes(item.key))) {
           ind !== -1 && this.$set(this.searchFiledGroup[ind], 'value', '')
           result = result.filter(item => {
             return item.key !== 'createdTime'
           })
        } else {
          if (!this.searchFiledGroup[ind].value || !this.searchFiledGroup[ind].value.length) {
            result.push({
                category: "all",
                fieldValue: defaulTime.join(','),
                key: "createdTime",
                label: "订单创建时间",
                placeholder: "订单创建时间",
                queryValue: "",
                value: defaulTime
            })
            ind !== -1 && this.$set(this.searchFiledGroup[ind], 'value', defaulTime)
          }
        }
      }
      console.log('result', result)
      return result
    }
  },
  watch: {
    config(old, data) {
      if (!this.configFlag) {
        this.configFlag = true;
      }
    },
    searchConditionList: {
      handler(newVal) {
        if (newVal && newVal.length) {
          this.templateName = newVal[0].composeKey
        } else {
          this.templateName = ''
        }
      },
      deep: true
    }
  },
  methods: {
    isOrderCreatedTime(item) {
      return this.fixedCreatedTime && item.key === 'createdTime'
    },
     maptext(item) {
      if (['daterange', 'numberRange'].includes(this.filterGroups[item.key]['category'])) {
        if (item.fieldValue === '-') {
          return '为空'
        }
        let index = item.fieldValue.indexOf(',')
        if (index === 0) {
          return item.fieldValue.replace(',', '-至')
        } else if(index === item.fieldValue.length - 1) {
          return item.fieldValue.replace(',', '至-')
        } else {
          return item.fieldValue.replace(',', '至')
        }
      } else if (['date'].includes(this.filterGroups[item.key]['category'])) {
        if (item.fieldValue === '-') {
          return '为空'
        } else {
          return item.fieldValue
        }
      } else {
        return item.fieldValue
      }
    },
    // 清除搜索条件
    handleDeleteFiledValue(item) {
      this.searchFiledGroup.map(ele => {
        if (ele.key === item.key) {
          ele.value = ''
        }
        return {...ele}
      })
      this.$set(this.filterGroups[item.key], 'saveList', [])
      // this.callbackAction('DeleteFieldVal', item)
    },
    callbackAction(action, param, isFirstLoad) {
      if (typeof this.callback !== 'function') return
      this.callback(action, param, isFirstLoad)
    },
    // 重置
    handleReset(action) {
      // 清除搜索条件的value值，el-autocomplete组件搜索取的是queryValue的值，这里要清除queryValue。
      this.searchFiledGroup.map(ele => {
        if (ele.key && (!this.fixedCreatedTime || ele.key !== 'createdTime')){
          this.$set(this.filterGroups[ele.key], 'value', '')
          this.$set(this.filterGroups[ele.key], 'queryValue', '')
          this.$set(this.filterGroups[ele.key], 'saveList', [])
        }
      })
      this.callbackAction(action, {composeKey: this.templateName})
    },
    // btn分发, 优先调用内部回调处理, 再通知props传入接收动作的回调
    handleBtn(action) {
      let fn = this[`handle${action}`];
      if (typeof fn === 'function') {
        return fn(action)
      }
      this.callbackAction(action, {composeKey: this.templateName})
    },
    // 切换显示隐藏搜索模板
    handleChangeTemplateShow() {
      this.searchTemplateShow = !this.searchTemplateShow
    },
    showPopver() {
      this.composeKey = ''
    },
    // 取消关闭elpopover
    handleCancel() {
      this.visible = false
    },
    // 直接保存模板
    handleSaveTemplate() {
      // let composeKey = this.searchConditionList[0].composeKey
      this.$confirm('是否保存该条模板?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.searchConditionSave({composeKey: this.templateName})
        // this.callbackAction('ConditionSave', {composeKey: this.templateName})
      }).catch((err) => {
      });
    },
    // 另存搜索模板
    handleSaveAsTemplate() {
      if(!this.composeKey) {
        return this.$message({
          type: 'error',
          message: '请输入模板名称'
        })
      }
      this.visible = false
      this.searchConditionSave({composeKey: this.composeKey})
      // this.callbackAction('ConditionSave', {composeKey: this.composeKey})
    },
    // 删除搜索模板
    handleConditionDelete(item) {
      this.searchConditionDelete(item)
      // this.callbackAction('ConditionDelete', item)
    },
    // 点击选择模板按钮&保存
    handleClickCondition(item, index) {
      this.templateName = item.composeKey
      this.searchConditionSave(item, 'immediateSave')
      // if (!index) return
      // this.callbackAction('ConditionImmediateSave', item)
    },
    // 选择下拉更多模板
    handleChangeCondition(val) {
      if (val) {
        let findItem = this.searchConditionList.find(item => item.composeKey === val)
        this.searchConditionSave(findItem, 'immediateSave')
        // this.callbackAction('ConditionImmediateSave', findItem)
      }
    },
    isJSON(str) {
      if (typeof str == 'string') {
        try {
          let obj = JSON.parse(str)
          if (typeof obj == 'object' && obj ) {
            return true
          } else {
            return false
          }
        } catch(e) {
          console.log('error：'+str+'!!!'+e)
          return false
        }
      }
    },
    // 获取自定义搜索查询
    getSearchConditionInfo(changeRole, isFirstLoad) {
      // console.log('this.searchConditionList', this.searchConditionList )
      searchConditionInfo({
        scenesCode: this.roleSwitchRouters.includes(this.$route.name) ? `${this.$route.name}_${this.currRole}` : this.$route.name
      }).then(res => {
        let { defaultConfigList, customConfigList } = res.data
        // 订舱列表特殊处理把后端配置的默认模板中的bdEmployeeName改为bdEmployeeId
        if (this.$route.name === 'BookShip' || this.$route.name === 'OrderList') {
          let searchItemList = defaultConfigList.length ? [...defaultConfigList[0].searchItemList] : []
          searchItemList.forEach(item => {
            if (item.searchField === 'bdEmployeeName') {
              item.searchField = 'bdEmployeeId'
            } 
          })
          customConfigList.forEach(item => {
            item.searchItemList.forEach(ele => {
              if (ele.searchField === 'bdEmployeeName') {
                ele.searchField = 'bdEmployeeId'
              }
            })
          })
        }
        this.resDefaConfList = defaultConfigList
        // 搜索模板存在，就默认显示第一个模板的搜索条件。不存在搜索模板，则显示后端配置的默认模板
        // 后端如果没有配置模板的话，则前端显示默认一个空的搜索条件
        if (!customConfigList || !customConfigList.length) {
          // 后端无配置默认模板
          if (!defaultConfigList || !defaultConfigList.length) {
            this.searchConditionList = []
            this.callbackAction('Update', [], isFirstLoad)
            this.$forceUpdate()
            changeRole && this.callbackAction('Search')
            return
          }
          // 有配置默认模板
          this.searchConditionList = []
          let composeKey = defaultConfigList[0].composeKey
          this.setSearchCondition(composeKey, defaultConfigList, changeRole, isFirstLoad)
          // this.getList()
        } else {
          this.searchConditionList = customConfigList
          // 获取自定义搜索数据后默认选中第一个模板
          let composeKey = customConfigList[0].composeKey
          this.setSearchCondition(composeKey, [], changeRole, isFirstLoad)
        }
      })
    },
    getTimeValue(searchField, value) {
      if (this.fixedCreatedTime && searchField === 'createdTime') {
        // 创建时间保存进模板不生效
        return ''
      } else {
        return value ? value.split(',') : ''
      }
    },
    // 按选中的搜索模板设置搜索条件反显
    setSearchCondition(composeKey, defaultConfigList, changeRole, isFirstLoad) {
      // console.log('defaultConfigList222222', defaultConfigList)
      let searchFiledGroup = []
      let searchItemList = []
      let findItem = []
      findItem = this.searchConditionList.find(item => item.composeKey === composeKey)
      // 后端有配置好的模板
      if (defaultConfigList && defaultConfigList.length) {
        findItem = defaultConfigList.find(item => item.composeKey === composeKey)
      }
      searchItemList = findItem ? findItem.searchItemList : []
      // console.log('searchItemList', searchItemList)
      searchItemList.map(item => {
        let value = ''
        // console.log('typeof',typeof (JSON.parse(item.searchValue)))
        if (!item.searchValue) {
          value = ''
        } else {
          console.log(item.searchValue)
          if (this.isJSON(item.searchValue)) {
            let searchValue = JSON.parse(item.searchValue)
            if (searchValue && typeof(searchValue) === 'object') {
              value = searchValue.value
              // 时间区间，下拉搜索查询，下拉多选特殊处理反显
              if (this.filterGroups[item.searchField] && this.filterGroups[item.searchField].category === 'daterange') {
                value = this.getTimeValue(item.searchField, value)
              }
              if (this.filterGroups[item.searchField].type && ['remoteSelect', 'select', 'cascader'].includes(this.filterGroups[item.searchField].type)) {
                this.filterGroups[item.searchField].saveList = searchValue.saveList
              }
            }
          }
        }
        searchFiledGroup.push({
          key: item.searchField,
          value: value,
          category: 'all',
          queryValue: ''
        })
      })
      this.callbackAction('Update', searchFiledGroup, isFirstLoad)
      // console.log('搜索条件反显')
      changeRole && this.callbackAction('Search')
    },
    // 保存搜索条件
		searchConditionSave(param, type) {
      let searchItemList = []
			this.searchFiledGroup.map(item => {
        let searchItemObj = this.filterGroups[item.key]
				if (item.key) {
					// 特殊处理的几种查询类型,daterange,remoteSelect,mulitple
					let searchValue = {key: item.key, value: item.value, saveList: []}
					// searchValue = item.value
					if (searchItemObj.category === 'daterange') {
						Object.assign(searchValue, {value: item.value ? item.value.toString() : ''})
					}
					if (['remoteSelect', 'select', 'cascader'].includes(searchItemObj.type)) {
						Object.assign(searchValue, {
							saveList: searchItemObj.saveList
						})
					}
					searchItemList.push({
						searchField: item.key,
						searchValue: JSON.stringify(searchValue)
					})
				}
			})
			// console.log('select.data', this.filterGroups['bkgAgentSupplierId'].data)

			if (type === 'immediateSave') {
				searchItemList = param.searchItemList
			}
			searchConditionSave({
				scenesCode: this.roleSwitchRouters.includes(this.$route.name) ? `${this.$route.name}_${this.currRole}` : this.$route.name,
				composeKey: param.composeKey,
				searchConfigList: searchItemList
			}).then(res => {
				if (type === 'immediateSave') {
					// 选中的模板切换设置相应的搜索条件反显
					this.setSearchCondition(param.composeKey)
					return
				} else {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.getSearchConditionInfo()
						}
					})
				}
			})
		},
		// 删除搜索模板
		searchConditionDelete(param) {
			this.$confirm('是否确认删除该搜索模板?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					searchConditionDelete({
						scenesCode: this.roleSwitchRouters.includes(this.$route.name) ? `${this.$route.name}_${this.currRole}` : this.$route.name,
						composeKey: param.composeKey
					}).then(res => {
						this.$message({
							type: 'success',
							message: '删除成功',
							duration: 1000,
							onClose: () => {
								this.getSearchConditionInfo()
							}
						})
					})
				})
				.catch(err => {})
		}
  }
}
</script>

<style lang="scss">
@import '../less/search.scss';
.order-create-filter {
  .label {
    font-size: 12px;
  }
  margin-top: 10px;
  display: flex;
  align-items: center;
  .filter-select {
    width: 150px;
  }
}
</style>
