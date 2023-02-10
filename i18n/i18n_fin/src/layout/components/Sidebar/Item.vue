<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon, title, name } = context.props
    const vnodes = []

    if (icon) {
      if (icon.includes('el-icon')) {
        vnodes.push(<i class={[icon, 'sub-el-icon']} />)
      } else {
        vnodes.push(<svg-icon icon-class={icon}/>)
      }
    }

    if (title) {
      // vnodes.push(<span slot='title'>{(title)}</span>)
      let lang = localStorage.getItem('locale') ? localStorage.getItem('locale').split('-')[0] : 'en'
      if (lang === 'zh') {
        let sp = h('span', {
          attrs: {
            slot: 'title',
            name: name
          }
        }, title)
        vnodes.push(sp)
      } else {
        if (title && title.length > 26) {
          let shortitle = title
          let n = 25
          if (shortitle[n - 1] === ' ') {
            n = n - 1 // 空格取少一位
          }
          shortitle = shortitle.substring(0, n) + '...'
          let sp = h('span', {
            attrs: {
              slot: 'title',
              name: name,
              title: title
            }
          }, shortitle)
          vnodes.push(sp)
        } else {
          let sp = h('span', {
            attrs: {
              slot: 'title',
              name: name
            }
          }, title)
          vnodes.push(sp)
        }
      }
    }
    return vnodes
  }
}
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}
</style>
<style lang="scss">
#app .sidebar-container .is-active > .el-submenu__title {
  font-weight: bold;
  color: #0055AC !important;
}
.el-menu-item.is-active {
  color: #0055AC !important;
}
// .el-scrollbar__view {
//   &>.el-menu {
//     &>.parentMenu {
//       &>.el-submenu {
//         &>.el-submenu__title {
//           padding-left: 14px !important;
//         }
//       }
//     }
//     .el-submenu__icon-arrow {
//       right: 13px;
//     }
//   }
// }
</style>
