<template>
  <div class="tags-cnt">
    <el-scrollbar
      @wheel.native.prevent="handleScroll"
      ref="scrollContainer"
      class="tag-srollbar-cnt"
    >
      <ul id="tags">
        <li
          v-for="(item, index) in state.tags"
          @click="goSub(item)"
          @contextmenu.prevent="openMenu(item, $event)"
          :class="{
            'tag-active': item.url === state.activeTag.url
          }"
        >
          {{ item.title }}
          <i
            class="el-icon-close"
            v-show="state.tags.length > 1 || index !== 0"
            @click.stop="close(item)"
          ></i>
        </li>
      </ul>
    </el-scrollbar>
    <ul
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu"
    >
      <li @click="copySelectedTag">{{$t('tags.copy')}}</li>
      <li @click="closeSelectedTag">{{$t('tags.close')}}</li>
      <li @click="closeOthersTags">{{$t('tags.closeOther')}}</li>
      <li @click="closeAllTags">{{$t('tags.closeAll')}}</li>
    </ul>
  </div>
</template>

<script>
import actions from '@/store'
import Sortable from 'sortablejs'
export default {
  inject: ['scrollToTag'],
  data() {
    return {
      left: '',
      top: '',
      visible: false,
      selectedTag: '',
      state: {},
      historyTag: []
    }
  },
  watch: {
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    },
    $route(value) {
      this.scrollToTag()
    }
  },
  created () {
    this.state = actions.getGlobalState()
    // this.getTag()
  },
  methods: {
    // getTag () {
    //   // 新开tag
    //   let { url } = this.state.activeTag
    //   let { fullPath, path, name, meta } = this.$route
    //   if (url !== fullPath) {
    //     let tag = {}
    //     // 子应用
    //     if (!name) {
    //       let sub = path.split('/')
    //       let { appName } = this.state
    //       let routes = JSON.parse(sessionStorage.getItem(`${appName}-routes`))
    //       let source = this.findRouter(routes, sub.at(-1))
    //       tag = {
    //         title: source?.meta?.title,
    //         code: source?.name,
    //         url: fullPath
    //       }
    //     } else {
    //       // 主应用
    //       tag = {
    //         title: meta.title,
    //         code: name,
    //         url: fullPath
    //       }
    //     }
    //     if (tag.code) {
    //       actions.setGlobalState({
    //         activeTag: tag,
    //       })
    //       actions.addGlobalTag(tag)
    //       this.editHistoryTag(tag, 'add') // 历史记录
    //     }
    //   }
    //   this.scrollToTag()
    //   sessionStorage.setItem('store', JSON.stringify(actions.getGlobalState()))
    //   sessionStorage.setItem('lastUrlNoLogin', location.href)
    // },
    editHistoryTag(tag, type='del') {
      let codes = this.historyTag.map((item) => item.code)
      let index = codes.indexOf(tag.code)
      if (index !== -1) {
        this.historyTag.splice(index, 1)
      }
      if (type === 'add') {
        this.historyTag.push(tag)
      }
    },
    findRouter(routes = [], path) {
      let res = null
      routes.forEach((item) => {
        if (item.children) {
          let find = this.findRouter(item.children, path)
          if (find) {
            res = find
          }
        } else {
          if (item.path === path) {
            res = item
          }
        }
      })
      return res
    },
    handleScroll(e) {
      const eventDelta = e.wheelDelta || -e.deltaY * 40
      const $scrollWrapper = this.$refs.scrollContainer.$refs.wrap
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
    },
    goSub(item) {
      this.editHistoryTag(item, 'add') // 历史记录
      actions.setGlobalState({
        activeTag: item,
      })
      history.pushState(null, '', `/#${item.url}`)
    },
    close(item) {
      this.selectedTag = item
      this.closeSelectedTag()
    },
    openMenu(tag, e) {
      this.selectedTag = tag
      this.left = e.clientX
      this.top = e.clientY
      this.visible = true
    },
    copySelectedTag() {
      let { url } = this.selectedTag
      let orign = location.origin
      window.open(`${orign}/#${url}`, '_black')
    },
    closeAllTags() {
      let home = {
        title: this.$t('tags.home'),
        activeMenu: 'Home',
        code: 'Home',
        url: '/home'
      }
      let tags = [{ ...home }]
      let activeTag = { ...home }
      this.historyTag = [ home ]
      actions.setGlobalState({ tags, activeTag})
      return this.$router.push({ name: 'Home' })
    },
    closeSelectedTag() {
      let tags = this.state.tags.filter(
        (item) => item.code !== this.selectedTag.code
      )
      actions.setGlobalState({ tags })
      // 关闭是当前
      if (this.selectedTag.code === this.state.activeTag.code) {
        // 删除历史记录
        this.editHistoryTag(this.selectedTag) 
        // 回退到上一步
        let active = this.historyTag.length ? this.historyTag.slice(-1)[0] : tags.slice(-1)[0]
        // 如果historyTag里面无数据取tag最后一个
        if (active.code === 'Home' && tags.length > 1) {
          active = tags.slice(-1)[0]
        }
        actions.setGlobalState({ activeTag: active, activeCode: active.code })
        history.pushState(null, '', `/#${this.state.activeTag.url}`)
      }
    },
    closeOthersTags() {
      this.activeTag = this.selectedTag
      this.tags = [this.selectedTag]
      this.historyTag = [this.selectedTag]
      actions.setGlobalState({
        tags: this.tags,
        activeTag: this.activeTag,
        activeCode: this.activeTag.code
      })
      history.pushState(null, '', `/#${this.activeTag.url}`)
    },
    closeMenu() {
      this.visible = false
    }
  },
  mounted() {
    this.$nextTick(() => {
      let ele = document.getElementById('tags')
      Sortable.create(ele, {
        group: 'tags',
        animation: 100,
        onEnd: (event) => {
          // console.log(event)
        }
      })
      this.historyTag = [...this.state.tags]
    })
  }
}
</script>

<style lang="scss" scoped>
.tags-cnt {
  width: 100%;
  overflow: auto;
  background-color: #F5F5F5;
  ul {
    display: flex;
    padding: 5px 5px 0 5px;
    li {
      list-style: none;
      color: #999;
      height: 22px;
      line-height: 22px;
      cursor: pointer;
      padding: 0 5px;
      flex-shrink: 0;
      i {
        width: 14px;
        height: 14px;
        line-height: 14px;
        border-radius: 50%;
        text-align: center;
      }
      i:hover {
        background-color: #cbd0da;
        color: #fff;
      }
      &.tag-active {
        box-shadow: 0 0 8px #EEEEEE;
        background-color: #fff;
        color: #333;
        border-radius: 4px 4px 0 0;
        // font-weight: bold;
      }
    }
  }
  .contextmenu {
    display: flex;
    flex-direction: column;
    margin: 0;
    background: #fff;
    position: fixed;
    z-index: 9999;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    -webkit-box-shadow: 2px 2px 3px 0 rgb(0 0 0 / 30%);
    box-shadow: 2px 2px 3px 0 rgb(0 0 0 / 30%);
    width: 80px;
    li {
      color: #333;
      cursor: pointer;
      margin: 0;
      &:hover {
        background-color: #eee;
      }
    }
  }
}
</style>
