import Vue from 'vue'

function notRouteBeforeRouteLeave (to, from) {
  let $NotRouteBeforeRouteLeave = Vue.prototype.$NotRouteBeforeRouteLeave
  // console.log('$NotRouteBeforeRouteLeave', $NotRouteBeforeRouteLeave)
  if ($NotRouteBeforeRouteLeave) {
    $NotRouteBeforeRouteLeave(to, from)
  }
  Vue.prototype.$NotRouteBeforeRouteLeave = null

  // 额外处理一个事情，解决当跳转时，鼠标滑过vxe-table ellipsis，tooltip显示在下一个页面
  let vxeTableTooltips = document.querySelectorAll('body>.vxe-table--tooltip-wrapper')
  vxeTableTooltips.forEach(item => {
    if (item.className.includes(' is--visible')) {
      item.className = item.className.replace(' is--visible', '')
    }
  })
}

export default notRouteBeforeRouteLeave