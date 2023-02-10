<template>
 <div>
   <div class="follow-filter">
    <div class="follow-filter-one">
      <div class="radio-class">
         <el-radio-group v-model="statusType" size="mini" @change="handleSearchByService">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button  size="mini" v-for="(item, index) in showList" :key="index" :label="item.key">
              {{ item.label }}
              <span v-if="item.orderCount && activityKey !== 'all'" class="show-num">{{ item.orderCount }}</span>
            </el-radio-button>
         </el-radio-group>
       </div>
       <el-button type="primary" size="mini" @click="setService">设置跟进项</el-button>
    </div>
    <div class="follow-filter-two">
      <div class="follow-filter-two-left">
        <div class="radio-item" v-if="showItemList && showItemList.length">
          <span>{{targetItem}}：</span>
          <el-radio-group v-model="subStatusType" size="mini" @change="handleSearchBySubStatus">
            <el-radio-button  size="mini" v-for="(item, index) in showItemList" :key="index" :label="item.matterCode">
              {{ item.matterName }}
              <span v-if="item.orderCount" class="show-num">{{ item.orderCount }}</span>
            </el-radio-button>
          </el-radio-group>
          <el-button class="ml10" type="primary" size="mini" @click="setService2">设置子跟进项</el-button>
        </div>
        <div class="copy-item">
          <span>
            <span>参考模板</span>
            <el-tooltip  class="item" effect="dark" content="下拉的模板是别人设置过的表头信息，可以复制为自己的模板" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            <span>：</span>
          </span>
          <el-select v-model="copyEmployeeId" size="mini"  filterable clearable placeholder="请选择" @change="templateChange">
            <el-option
              v-for="item in employeeIdOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          
          <el-button :loading="copyLoading" v-if="copyEmployeeId" @click="copy" class="copy-btn" type="primary" size="mini">复制成我的模板</el-button>
        </div>
      </div>
      <div class="follow-filter-two-right" v-show="statusType === 'all'">
        <div class="color-item" v-for="(item, index) in colorItem" :key="index">
          <div class="color-item-show" :style="{ backgroundColor: item.color }"></div>
          <div class="txt">{{ item.txt }}</div>
        </div>
      </div>
    </div>
    </div>
  <div v-if="customColumnsPopShow">
     <CustomColumns :title="'设置跟进项'" :columnsTitle="['可选跟进项', '我的跟进项']"  :showModel="false" :columnsBase="followItems" :configColumns="showCustomList" @close="customColumnsPopClose" />
  </div>
  <div v-if="customColumnsPopShow2">
     <CustomColumns :title="'设置子跟进项'" :columnsTitle="['可选子跟进项', '我的子跟进项']"  :showModel="false" :columnsBase="followItems2" :configColumns="showCustomList2" @close="customColumnsPopClose2" />
  </div>
</div>
</template>

<script>
import CustomColumns from '@/components/customColumns/index'
import { getFollowTitleList, followTitleSave, getColumnConfigEmployeeList } from '@/api/order/followItems'
import { mapState } from 'vuex'
const colorItem = [
  {
    txt: '进行中',
    color: '#FEE09B'
  },
  {
    txt: '已完成',
    color: '#9ACC8B'
  },
  {
    txt: '已拒绝',
    color: '#F19586'
  },
]
export default {
  props: {
    componentKey: {
      type: String,
      default: ''
    },
    activityKey: {
      type: String,
      default: ''
    },
    searchInputGroup: {
      type: Array,
      default: () => {
        return []
      }
    },
    tableQuery: {
      type: Object,
      default: () => {
        return {}
      }
    },
    scenesCode: {
      type: String,
      default: ''
    },
    callback: {
			type: Function,
			default: () => ({})
		}
  },
  components: { CustomColumns },
  created() {
    this.statusType = this.componentKey
    this.init()
    this.getColumnConfigEmployeeListData()
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
    }),
    showList() {
      return this.followItems.filter(item => {
        return item.isShow === 'yes'
      })
    },
    showItemList() {
      return this.followItems2.filter(item => {
        return item.isShow === 'yes'
      })
    },
    showCustomList() {
      return this.followItems.filter(item => item.isShow === 'yes').map(item => {
        return item.key
      })
    },
    showCustomList2() {
      return this.followItems2.filter(item => item.isShow === 'yes').map(item => {
        return item.key
      })
    }
  },
  data() {
    return {
      statusType: '',
      followItems: [],
      customColumnsPopShow: false,
      customColumnsPopShow2: false,
      subStatusType: '',
      targetItem: '',
      employeeId: '',
      copyEmployeeId: '',
      employeeIdOptions: [],
      copyLoading: false,
      timer: null,
      colorItem,
      followItems2: [],
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    this.timer = null
  },
  watch: {
    componentKey(val) {
       this.statusType = val
    },
    activityKey() {
       this.init()
    },
    "searchInputGroup": {
      handler (val) {
        this.getEmployeeId()
      },
      deep: true
    },
    scenesCode() {
      this.getColumnConfigEmployeeListData()
    }
  },
  methods: {
    getEmployeeId() {
      this.employeeId = (this.searchInputGroup.find(item => {
        return item.key === 'employeeId'
      }) || {}).value || ''
    },
    getColumnConfigEmployeeListData() {
      this.copyEmployeeId = ''
      this.employeeIdOptions = []
      this.$store.dispatch('followItems/setTemplateData', {})
      let pageParams = {
        currPage: 1,
        pageSize: 1000
      }
      getColumnConfigEmployeeList({ scenesCode: this.scenesCode, ...pageParams })
      .then(res => {
        this.employeeIdOptions = (res.data.list || []).filter(item => {
           return item.employeeId !== this.userId
        }).map(item => {
          item['value'] = item.employeeId
          item['label'] = item.cname + '-' + item.deptCname
          return item
        })
      })
    },
    templateChange(employeeId) {
      this.$emit('selectTemplate', { employeeId, scenesCode: this.scenesCode })
    },
    copy() {
      this.copyLoading = true
      this.$emit('copyTemplate')
      this.timer = setTimeout(() => {
         this.copyEmployeeId = ''
         this.templateChange()
         this.copyLoading = false
      }, 800)
    },
    init(type) {
      let tableQuery = {}
      if (type && type.listType) {
        tableQuery = Object.assign({}, type)
      } else {
        tableQuery = Object.assign({}, this.tableQuery)
      }
      getFollowTitleList({listType: this.activityKey, employeeId: this.activityKey !== 'owner' ? this.employeeId : '',  ...tableQuery })
      .then(res => {
         let list = res.data.sort((a, b) => { return a['order'] - b['order'] })
         this.followItems = list.map(item => {
            item['key'] = item.code
            item['label'] = item.name
            return item
         })
         type === 'custom' && this.callback('Check', this.followItems)
         if (type !== 'custom') {
            this.getfollowItems2(this.statusType)
         }
         if (type === 'custom2') {
            if (this.subStatusType && !this.showCustomList2.includes(this.subStatusType)) {
              this.subStatusType = ''
              this.handleSearchBySubStatus()
            }
         }
      })
    },
    setService() {
      this.customColumnsPopShow = true
    },
    setService2() {
      this.customColumnsPopShow2 = true
    },
    getData(list) {
      let arr = []
      let obj = {}
      let newObj = {}
      list.forEach((item,index) => {
        if (item) {
           obj = this.followItems.find(item1 => {
              delete item1.key
              delete item1.label
              return item1.code === item
            })
            newObj = Object.assign({}, obj, { order: index + 1, isShow: 'yes' })
            arr.push(newObj)
        }
      })
      return arr
    },
    // 自定义表头关闭回调
		customColumnsPopClose(action, value) {
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
        let data = this.getData(value)
        console.log('保存数据: ', data)
        followTitleSave(data)
        .then(res => {
          this.init('custom')
        })
			}
		},
    getData2(list) {
      let arr = []
      let subTitleArr = []
      let obj = {}
      let newObj = {}
      this.showList.forEach(item => {
        if (item.code === this.statusType) {
          list.forEach((item1,index) => {
            obj = item.subTitle.find(item2 => {
              delete item2.key
              delete item2.label
              return item2.matterCode === item1
            })
            if (item1) {
              newObj = Object.assign({}, obj, { order: index + 1, isShow: 'yes' })
              subTitleArr.push(newObj)
            }
          })
          Object.assign(item, { subTitle: subTitleArr })
        }
        arr.push(item)
      })
      return arr
    },
    customColumnsPopClose2(action, value) {
      this.customColumnsPopShow2 = false
			if (action === 'Confirm') {
        let data = this.getData2(value)
        console.log('保存数据: ', data)
        followTitleSave(data)
        .then(res => {
          this.init('custom2')
        })
			}
    },
    getfollowItems2(code) {
      let arr = (this.showList.filter(item => {
        return item.code === code
      })[0] || {}).subTitle || []
      this.followItems2 = arr.sort((a, b) => { return a['order'] - b['order'] }).map(item => {
        item['key'] = item.matterCode
        item['label'] = item.matterName
        return item
      })
    },
    handleSearchByService(code) {
      this.subStatusType = ''
      this.$store.dispatch('followItems/setSubStatusTypeVal', '')
      this.getfollowItems2(code)
      let obj = this.showList.find(item => {
        return item.key === this.statusType
      })
      this.targetItem = (obj && obj.label) || ''
      this.callback('ChangeService', this.statusType)
    },
    handleSearchBySubStatus() {
      console.log('触发了')
      this.callback('ChangeSubStatus', this.subStatusType)
      this.$store.dispatch('followItems/setSubStatusTypeVal', this.subStatusType)
    },
    handleRefresh() {
       this.callback('Refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.follow-filter {
  .follow-filter-two {
    margin-top: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .follow-filter-two-left {
      display: flex;
      align-items: center;
      .radio-item {
        display: flex;
        align-items: center;
        margin-right: 10px;
      }
      .copy-item {
        display: flex;
        align-items: center;
        .copy-btn {
          margin-left: 10px;
        }
      }
    }
    .follow-filter-two-right {
      font-size: 12px;
      display: flex;
      align-items: center;
      .color-item+.color-item {
        margin-left: 40px;
      }
      .color-item {
        display: flex;
        align-items: center;
        .color-item-show {
          width: 12px;
          height: 12px;
        }
        .txt {
          margin-left: 10px;
        }
      }
    }
  }
  .follow-filter-one {
    display: flex;
    justify-content: space-between;
    flex: 1;
   
   .radio-class {
     flex-wrap: wrap;
     max-width: calc(100%-70px);
   }
  }
  .el-radio-button {
    position: relative;
    z-index: 1;
    .show-num {
      position: absolute;
      height: 14px;
      padding: 1px 3px;
      font-size: 12px;
      font-family: 'MicrosoftYaHei-Bold, MicrosoftYaHei';
    //  font-weight: bold;
      color: #FFFFFF;
      line-height: 12px;
      border-radius: 4px;
      box-shadow: 0px 1px 2px 0px #E5B9B4;
      background-color: #CD4130;
      color: #fff;
      z-index: 2;
      // right: 0;
      // top: -9px;
      right: -2px;
      top: -10px;
      transform: scale(.8);
    }
    .red-num {
      color: #e63923;
    }
  }
  .ml10 {
    margin-left: 10px;
  }
  /deep/.is-active {
    .el-radio-button__inner {
      color: #fff !important;
      background-color: #409eff !important;
      border-color: #409eff !important;
    }
  }
  /deep/.el-radio-button--mini .el-radio-button__inner {
     padding: 3px 7px;
     height: 20px;
   }
}
</style>