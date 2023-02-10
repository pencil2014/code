<template>
  <div class="input-container operation-btns-box">
    <el-button size="mini" ref="btnQuery" @click="handleSearch" type="primary">
      <!-- <i class="el-icon-search"></i> -->搜索
    </el-button>
    <el-button v-if="showRefresh" size="mini" @click="handleRefresh" type="primary">
      刷新
    </el-button>
    <el-button size="mini" ref="btnRefresh" @click="handleReset" plain>
      <!-- <i class="el-icon-refresh"></i> -->重置
    </el-button>
    <el-button type="text" size="mini" @click="handleChangeTemplateShow" v-show="!searchConditionHide" class="ml0">
      模板
      <i class="search-template-contral" :class="searchTemplateShow ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
    </el-button>
  </div>
</template>

<script>
import Config from '@/components/Base/config'

export default {
  name: 'searchBtn',
  data() {
    return {
      Config: Config
    }
  },
  props: {
    callback: {
      type: Function,
      default: () => ({})
    },
    searchTemplateShow: {
      type: Boolean,
      default: false
    },
    searchConditionHide: {
      type: Boolean,
      default: false
    }
  },
  mounted() {},
  computed: {
    showRefresh() {
      let routeNameList = [
        'AirTransportOrderList',
        'AirTransportJointList',
        'AirTransportBookShip',
        'OrderList',
        'JointList',
        'BookShip',
        'RailwayOrderList',
        'RailwayJointList'
      ]
      if (routeNameList.indexOf(this.$route.name) > -1) {
        return true
      }
      return false
    }
  },
  methods: {
    callbackAction(action) {
      if (typeof this.callback !== 'function') return
      this.callback(action)
    },

    handleSearch() {
      this.callbackAction('Search')
    },

    handleReset() {
      this.callbackAction('Reset')
    },
    handleChangeTemplateShow() {
      this.callbackAction('ChangeTemplateShow')
    },
    handleRefresh(){
      this.callbackAction('Refresh')
    }
  }
}
</script>

<style></style>
