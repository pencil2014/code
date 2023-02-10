<template>
  <div @click="goRouteTo" :class="{'cursor-class': param[item.key]}">{{ getVal() }}</div>
</template>

<script>
import { getDictLabel } from '@/utils/tools'
import { mapState } from 'vuex'
export default {
  props: ['param', 'item'],
  created() {},
  computed: {
		...mapState({
			statusColumns: state => state.followItems.allList.statusColumns,
		})
	},
  methods: {
    getVal() {
      let mapList = (this.statusColumns.find(item => { 
        return item.key === this.item.key 
      }) || {}).mapValue || []
      if (mapList.length) {
        return getDictLabel(mapList, this.param[this.item.key]) || '-'
      } else {
        return '-'
      }
    },
    goRouteTo() {
      let val = this.param[this.item.key]
      let targetPage = {}
      let name = ''
      let query = {}
      let params = {}
      let routePage = (this.statusColumns.find(item => { 
        return item.key === this.item.key 
      }) || {}).routePage || []
      if (val && routePage.length) {
        if (routePage.length === 1 && !routePage[0].statusList) {
          // 所有状态统一跳一个页面
          targetPage = routePage[0]
        } else {
          targetPage = routePage.find(item => {
            return item.statusList.includes(val)
          })
        }
        if (targetPage) {
          name = targetPage.name
          query = this.getValue(targetPage.queryList)
          params = this.getValue(targetPage.paramsList)
          let routeUrl = this.$router.resolve({
            name,
            params,
            query: Object.assign({}, query, targetPage.query || {}),
          })
          window.open(routeUrl.href, '_blank')
        }
      }
    },
    getValue(list) {
      let obj = {}
      list = list || []
      let key = ''
      for (let i = 0; i < list.length; i++) {
        key = list[i]
        obj[key] = this.param[key]
      } 
      return obj
    }
  }
}
</script>

<style lang="scss" scoped>
.cursor-class {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>