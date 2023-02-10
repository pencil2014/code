import Vue from 'vue'
import { mapGetters } from 'vuex'

export const routerMixin = {
  data() {
    return {
      isJumpRouteFromPage: false, //是否从本页操作跳转至另一页面
      isFirstGetData: true, //是否首次获取数据
      loopJumpRoutes: ['SettlementDetail',], // 只支持SettlementDetail等可能导致循环跳转的路由，勿添加其他
    }
  },
  methods: {
    // tab内路由跳转
    routerPushTab(name, query) {
      this.$emit('update:isJumpRouteFromPage', true)
      this.routerPush(name, query)
    },
    // 路由跳转(isTabParams默认不传，如需支持tab内路由跳转传{isTab: true})
    routerPush(name, query, isTabParams = {}, params) {
      this.isJumpRouteFromPage = true
      let isTab = isTabParams === true ? true : isTabParams && isTabParams.isTab // true为兼容之前的写法
      if (isTab) {
        Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => { this.commonRoute(to, from) }
      }
      this.$router.push({ name, query, params })
    },
    // 路由返回 refresh返回的列表是否需要重新加载列表数据
    // 路由返回 close两级返回，详情页的子页面操作后关闭本页面返回详情页再关闭详情页再返回
    routerBack(refresh, close) {
      // console.log('refresh:', refresh)
      let jumpRouteFromToList = this.jumpRouteFromToList
      let currRoute = this.$route
      let fromTo = {}
      let query = this.$route.query
      if ((query.fromOrder || query.newWdo || query.from === 'orderFee') && this.visitedViews.length <= 1) {
        const loading = this.$loading({
          lock: true,
          text: '返回中...',
          spinner: 'el-icon-loading',
          background: 'rgba(255, 255, 255, 0.9)'
        })
        return setTimeout(() => { // return this.$router.push({ name: 'Dashboard' })
          window.close()
          loading.close()
        }, 1500)
      }
      if (this.loopJumpRoutes.includes(currRoute.name)) {
        let fromTos = jumpRouteFromToList.filter(item => {
          return item.to.name === currRoute.name
        })
        fromTos.sort(function (a, b) {
          return a.ts - b.ts
        })
        fromTo = fromTos.length ? fromTos[fromTos.length - 1] : ''
        // 结算单详情、结账单列表相互跳转死bug
        if (fromTo.from?.name === 'SettlementBillList') {
          return this.$router.push({
            name: 'SettlementList',
            params: {},
            query: {},
          })
        }
      } else {
        fromTo = jumpRouteFromToList.find(item => {
          // 收款核销的tab显示特殊，需要判断name和params下的writeoffNo是否全部一致
          let isSameParams = true
          if (item.to.name === 'WriteoffRecvDetail2') {
            isSameParams = item.to.params.writeoffNo === currRoute.params.writeoffNo
          }
          return item.to.name === currRoute.name && isSameParams
        })
      }
      // debugger
      if (fromTo) {
        if (this.loopJumpRoutes.includes(fromTo.from.name)) {
          let findIndex = jumpRouteFromToList.findIndex(item => {
            return item.to.name === fromTo.from.name && item.from.name === fromTo.to.name // 反过来查到这个删除，意思是比如从付款申请详情点返回到结算单详情，我们不认为结算单详情点返回是返回到付款申请详情
          })
          if (findIndex > -1) {
            jumpRouteFromToList.splice(findIndex, 1)
          }
        }
        // 是否点击返回或取消的跳转
        fromTo.from.meta.isClickBack = true
        // 如果 fromTo.from.meta.refresh 本身为true， 表明强制设置了，返回时refresh不为true时仍需刷新
        fromTo.from.meta.refresh = refresh === true || fromTo.from.meta.refresh
        fromTo.from.meta.close = close === true
        this.$router.push({
          name: fromTo ? fromTo.from.name : 'Dashboard', // path: fromTo ? fromTo.from.path : '',
          params: fromTo ? fromTo.from.params : {},
          query: fromTo ? fromTo.from.query : {},
        })
      } else {
        if (this.visitedViews.length <= 1) {
          window.close()
        } else {
          this.$router.push({
            name: 'Dashboard',
            params: {},
            query: {},
          })
        }
      }
    },
    // 路由离开卫士函数
    commonRoute(to, from, next) {
      // 收款核销详情页的tab显示特殊，显示为writeoffNo
      if (to.name === 'WriteoffRecvDetail2') {
        to.meta.title = to.params.writeoffNo
      }
      // 本页面设为需要缓存
      from.meta.isUseCache = true
      // 下一个页面是否需要缓存，如果是从本页操作路由跳转，则下一页面不需要缓存
      console.log('this.isJumpRouteFromPage: ', this.isJumpRouteFromPage)
      if (this.isJumpRouteFromPage) {
        // 将本页面isJumpRouteFromPage初始化
        this.isJumpRouteFromPage = false
        // 将跳转到的页面设置为无缓存
        to.meta.isUseCache = false
        if (this.loopJumpRoutes.includes(to.name)) { // 有可能会导致循环跳转的特殊的路由，保存多次路由记录
          let find = this.jumpRouteFromToList.find(item => {
            return item.to.name === to.name && item.from.name === from.name
          })
          if (!find) {
            this.jumpRouteFromToList.push({ from, to, ts: new Date().getTime() })
          } else {
            find = Object.assign(find, { ts: new Date().getTime() })
          }
        } else {
          // 保存路由记录，用于下一个页面的返回或取消功能
          // 当jumpRouteFromToList列表内有路由的name与即将跳转的路由name相同
          let find = this.jumpRouteFromToList.find(item => {
            // 收款核销的tab显示特殊，需要判断name和params下的writeoffNo是否全部一致
            let isSameParams = true
            if (item.to.name === 'WriteoffRecvDetail2') {
              isSameParams = item.to.params.writeoffNo === to.params.writeoffNo
            }
            return item.to.name === to.name && isSameParams
          })
          if (find) {
            find.from = from
            let refresh = find.to.meta.refresh
            find.to = to
            to.meta.refresh = to.meta.refresh || refresh
          } else {
            this.jumpRouteFromToList.push({ from, to })
          }
        }
      } else {
        to.meta.isUseCache = true
        let find = this.jumpRouteFromToList.find(item => item.to.name === to.name)
        if (find) {
          let refresh = find.to.meta.refresh
          to.meta.refresh = to.meta.refresh || refresh
        }
      }
      if (next) next()
    },
    delVisitedView(routeIn) {
      let route = routeIn ? routeIn : this.$route
      this.$store.commit('tagsView/DEL_VISITED_VIEW', route)
    },
    // refresh返回后刷新，close返回后再强制返回上级
    routerDelBack(refresh, close) {
      this.delVisitedView()
      this.routerBack(refresh, close)
    },
    // 强制刷新某个（第三方）列表页（仅涵盖列表页）
    refreshView(name, toOrFrom) {
      // debugger
      this.jumpRouteFromToList.forEach(item => {
        if (item[toOrFrom === 'from' ? 'from' : 'to'].name === name) {
          item[toOrFrom === 'from' ? 'from' : 'to'].meta.refresh = true
        }
      })
    },
  },
  // 路由离开前守卫
  beforeRouteLeave(to, from, next) {
    this.commonRoute(to, from, next)
  },
  // 路由进入前守卫 实例要在next回调中才能获取
  beforeRouteEnter(to, from, next) {
    if(to.meta && !to.meta.isNotFirst){
      to.meta.isNotFirst = true
      to.meta.isUseCache = false
    }
    // 详情页刷新，读取本地的jumpRouteFromToList，此时设置里面的值，不能触发真实路由内的值，要手动触发真实路由内的meta
    let find = Vue.prototype.jumpRouteFromToList.find(item => {
      let isSameParams = true
      if (item.to.name === 'WriteoffRecvDetail2') {
        isSameParams = item.to.params.writeoffNo === from.params.writeoffNo
      }
      return item.from.name === to.name && isSameParams
    })
    if (find) {
      to.meta.close = find.from.meta.close
    }
    next(vm => {
      // let find = vm.detailAndListArr.find(item => {
      //   return from.name === item.fromName && to.name === item.toName
      // })
      // 返回后，再强制返回上级。详情页的子页面直接关闭子页面和详情页跳转到列表页
      if (to.meta.close === true) {
        if (find) find.from.meta.close = false
        to.meta.close = false
        return vm.routerDelBack(true)
      }
      // debugger
      // 根据用户实际操作情况，2021-07-09改变方案，采用和详情页一样的方案，已知会测试
      // 列表页默认刷新，仅从详情页点击“返回”或“取消”返回列表页才不刷新，特殊情况下可强制刷新（非特殊情况请勿设置refresh）。
      // 注意这里是设置列表页的缓存，详情页、创建页和原来保持不变。
      // if (!find || to.meta.refresh || vm.isFirstGetData) {
      // console.log(to.meta.isUseCache, to.meta.refresh, vm.isFirstGetData)
      // debugger
      if (!to.meta.isUseCache || to.meta.refresh || vm.isFirstGetData) {
        if (vm.handleCurrentChange) {
          if (vm.isFirstGetData) {
            let { searchOption, searchOption1 } = vm
            searchOption = searchOption || searchOption1
            if (!(searchOption && (searchOption.saveShow || searchOption.saveDefault))) {
              vm.handleCurrentChange(1)
            } else {
              vm.isNotFirstRouter && vm.handleCurrentChange(1)
            }
          } else {
            vm.handleCurrentChange(1)
          }
          // to.meta.isUseCache = false
        } else if (vm.activeName && vm.$refs[vm.activeName]) { // 只有个别采用此方案
          console.log(vm.activeName)
          console.log(vm.$refs[vm.activeName])
          let { searchOption, searchOption1 } = vm.$refs[vm.activeName]
          searchOption = searchOption || searchOption1
          if (!(searchOption && (searchOption.saveShow || searchOption.saveDefault)) || to.meta.refresh) {
            (vm.$refs[vm.activeName][0] || vm.$refs[vm.activeName]).handleCurrentChange(1)
          } else if (searchOption && (searchOption.saveShow || searchOption.saveDefault)) {
            vm.isNotFirstRouter && (vm.$refs[vm.activeName][0] || vm.$refs[vm.activeName]).handleCurrentChange(1)
          }
          vm.$refs[vm.activeName].isFirstGetData = false
        }
        vm.isFirstGetData = false
      }
      vm.isNotFirstRouter = true
      to.meta.isUseCache = true
      to.meta.isClickBack = false
      to.meta.refresh = false
      vm.jumpRouteFromToList.forEach(item => {
        if (item.to.name === to.name) {
          item.to.meta.refresh = false
        }
      })
    })
  },
  computed: {
    ...mapGetters(['userInfo', 'visitedViews'])
  },
}
