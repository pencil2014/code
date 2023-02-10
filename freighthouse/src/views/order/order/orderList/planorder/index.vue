<template>
  <div class="app-container">
    <!-- <div class="plan-tabs-row">
      <el-tabs v-model="activityKey" @tab-click="handleClick">
        <el-tab-pane v-for="item in tabsMenu" :label="item.value" :name="item.key" :key="item.key">
          <span slot="label">{{ item.value }}</span>
        </el-tab-pane>
      </el-tabs>
    </div> -->
    <component :is="activityKey"></component>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Plan from './plan/index'
import Todo from './todo/index'
import Follow from './followItems/list/index'

export default {
  data() {
    return {
      activityKey: 'Follow',
    }
  },
  beforeRouteLeave(to, from, next) {
		if (to.name === 'OrderDetail' || to.name === 'JointOrderDetail') {
			let views = this.$store.state.tagsView.visitedViews.filter(item => item.params.orderNo === to.params.orderNo)
			this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
		}
		next()
	},
  created() {
  },
  mounted() {
  },
  destroyed(){
  },
  computed: {
    ...mapState({
      roles: state => state.user.roles,
    }),
    isFollowTmp() {
      console.log('process.env.VUE_APP_TITLE', process.env.VUE_APP_TITLE)
			return process.env.VUE_APP_TITLE !== 'production' || (this.roles && this.roles.includes('follow_tmp')) 
		},
    tabsMenu() {
      if (this.isFollowTmp) {
        return [
          {key: 'Plan', value: '计划单'},
          {key: 'Todo', value: '我的待办'},
          {key: 'Follow', value: '个人工作台'}
        ]
      } else {
        return [
          {key: 'Plan', value: '计划单'},
          {key: 'Todo', value: '我的待办'},
        ]
      }
    }
  },
  watch: {
  },
  components: {
    Plan,
    Todo,
    Follow
  },
  methods: {
    handleClick(tab, event) {
      console.log('tabs', tab, event)      
    },
  }
}
</script>
<style lang="scss">
.plan-tabs-row{
  background-color: #fff;
  .el-tabs__nav-scroll{
    padding-left: 20px;
  }
  .el-tabs__header{
    margin-bottom: 0;
  }
  .el-tabs__item{
    line-height: 26px;
    height: 26px;
    font-size: 12px;
  }
  .el-tabs__nav-wrap::after{
    z-index: 1;
  }
}
</style>
