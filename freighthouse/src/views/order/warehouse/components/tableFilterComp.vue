<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <el-button v-for="(item, i) in BtnList" :key="i" :type="item.type=='Add'?'primary':'default'" size="mini" @click="handleColumns(item.type)" class="ml10">
        <i class="el-icon-plus" v-if="item.type=='Add'"></i>{{item.label}}
      </el-button>
    </div>
    
    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.state" size="mini" @change="handleSearchStatus">
          <el-radio-button size="mini" v-for="(item, index) in status" :key="index" :label="item.value">{{item.label}}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data () {
    return {

    }
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    status: { 
      type:Array, 
      default:() => {[]}
    },
    // 接口传参
    tableQuery: {
      type: Object,
      default: () => ({})
    },
    BtnList: {
      type:Array, 
      default:() => {[]}
    },
    callback: {
      type: Function,
      default: () => ({})
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
  },
  components: {
  },
  methods: {

    handleColumns(type) {
      this.callback(type)
    },

    // 生成结算单
    handleGenerateStatement() {
      console.log('生成结算单')
    },

    // 通知放舱
    handleNotifyRelease() {
      console.log('通知放舱');
    },

    // 按发布状态查询
    handleSearchStatus(value) {
      Object.assign(this.tableQuery, {
        state: value
      })
      this.callback('SearchStatus')
    }
  }
}
</script>
<style scoped>

</style>  
