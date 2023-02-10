<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page"
    v-loading="lsLoading"
  >
    <div class="finance-container">
      <div class="finance-search-list-gap"></div>
      <el-tabs class="fin-el-tabs" v-model="activeItem" @tab-click="handleClick">
        <el-tab-pane
          :key="item.name"
          :label="item.label"
          :name="item.name"
          v-for="item in panes"
        >
      </el-tab-pane>
      </el-tabs>
    </div>
    <div class="finance-search-list-gap"
      v-if="activeItem == panes[0].name"
    ></div>
    <visitPlan ref="plan" v-if="activeItem==='visitPlan'" @changeTab="changeTab()"></visitPlan>
    <visitRecord ref="record" v-else></visitRecord>
  </div>
</template>
<script>
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import VisitPlan from '@/views/crm/merchantManagement/visitPlan/visitPlanList.vue'
import VisitRecord from '@/views/crm/merchantManagement/followLog/list2.vue'

/** ****** 自动引入组件  --end  ******** */
export default {
  name: 'visitManage',
  mixins: [mixin, routerMixin],
  components: {
    VisitPlan,
    VisitRecord
  },
  provide() {
  },
  computed: {
    activeName() {
      return this.activeItem 
    },
  },
  data() {
    const visitPales = [       
      {label:'拜访计划',name:'visitPlan'},
      {label:'拜访记录',name:'visitRecord'}
    ]
    return {
      panes:visitPales,
      activeItem: visitPales[0].name,
    }
  },
  watch: {
  },
  created() {
    this.changeTab()
  },
  methods: {
    handleClick() {
      if(this.activeItem==='visitRecord'){
          this.$nextTick(() => {
          this.$refs.record.search();
        })
      }else{
        this.$nextTick(() => {
          this.$refs.plan.search();
        })
      }
    },
    changeTab(){
      if(this.$route.query.type && this.$route.query.type==='visitRecord'){
        this.activeItem='visitRecord'
        this.handleClick()
      }else{
        this.activeItem='visitPlan'
      }
    },
  },
  mounted() {

  }
}
</script>
<style lang="scss" scoped>
.left-cnt {
  display: flex;
  line-height: 20px;
}
</style>
