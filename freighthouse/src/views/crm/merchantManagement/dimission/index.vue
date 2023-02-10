<template>
    <div
      class="finance-page"
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <div class="finance-list-container">
        <div class="money-box">
            <el-button @click="toApply" size="mini" type="primary" v-if="completing<2">申请离职</el-button>
        </div>
        <div class="process">
            <div class="title">离职流程</div>
            <Step :setComplete="completing" :process="process"></Step>
        </div>
      </div>
    </div>
  </template>
  <script>
  import store from '@/store'
  import DIMISSION from '@/api/crm/dimission'
  import { mapGetters, mapState } from 'vuex'
  import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
  import { routerMixin } from '@/views/finance/mixins/routerMixin'
  import Step from './components/step'
  const NLIST = []
  export default {
    name: 'dimissionApply',
    mixins: [mixin, routerMixin],
    components: { Step },
    inject: ['defaultRules'],
    data() {
      return {
        completing: 0,
        process:[]
      }
    },
    watch: {

    },
    computed: {
        ...mapGetters(['dictMap']),
      ...mapState('user', ['userId']),
    },
    created() {
        
    },
    activated () {
        this.handoverChain()
    },
    methods: {
        //申请离职
        toApply(){
            this.$confirmWarn('你确定要申请离职吗？', () => {
                DIMISSION.handover().then((res) => {
                    this.$msgSucClose('已申请离职!') 
               })
            })
        },
        //获取流程
        handoverChain(){
            DIMISSION.handoverChain().then((res) => {
                this.process = res.data
                if(res.data.length>0){
                  this.completing = Number(res.data.find(item=>item.currentPoint===true).approveLevel - 1)
                }else{
                  this.completing = 0
                }          
            })
        }
    },
  }
  </script>
  <style lang='scss' scoped>
    .finance-page{
        -moz-user-select: none; /*火狐*/
        -webkit-user-select: none; /*webkit浏览器*/
        -ms-user-select: none; /*IE10*/
        -khtml-user-select: none; /*早期浏览器*/
        -o-user-select:none;
        user-select: none;
    }
    .process{
        padding:25px 0
    }
    .title{
        text-align:center;
        font-size: 20px;
        padding: 0 0 20px;
    }
  </style>
  