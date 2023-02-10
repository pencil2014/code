import lsNumber from './number'   // 强制数字指令
import lsEmail from './email'   // 邮箱，简单的过滤掉不合法的输入字符，未验证邮箱格式
import scaleText from './scaleText'   // 元素字数过多，会缩小自身适应于父元素的大小

const install = function (Vue) {
  Vue.directive('lsNumber', lsNumber)
  Vue.directive('lsEmail', lsEmail)
  Vue.directive('scaleText', scaleText)
}

export default { install }