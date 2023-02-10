import Vue from 'vue'

export default {
  bind(el, binding, vnode) {
    // value=number表示需要数字处理
    // obj 需要处理的对象(对象为引用类型，可以改变原对象) key 需要处理对象的键名
    // positive 为true，表示处理为正数
    // dot 需要处理的小数点位数，不设置默认为2位
    let { value, obj, key, positive, dot, vm, formStr, option, rowIndex, form, listStr } = binding.value
    if (value === 'number') {
      let timeout = null
      let input = el.querySelector('input')
      input.oninput = function () {
        // console.log(rowIndex);
        // 设置timeout,提升性能，但是会出现输入的内容再删除。如需优化输入显示效果,去除延迟即可
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
          // console.log(this.value)
          let val = this.value
          if (isNaN(val)) {
            // 如果当前输入框内容不是数字，递归删除最后一位，直至成为数字
            let fnSlice = (str) => isNaN(str) && ((str !== '-') || positive) ? fnSlice(str.slice(0, -1)) : str
            val = fnSlice(val)
          }
          // console.log(obj, key, val);
          /* 只保留两位小数 */
          let dotPos = val.lastIndexOf('.')
          dot = dot || 2  // 默认两位小数，特殊时需要设置
          if (dotPos > -1 && val.length - dotPos > +dot + 1) {
            val = (+val).toFixed(dot)
          }
          if (positive && val[0] == '-') {
            val = Math.abs(val) + ''
          }
          if (vm && formStr) {
            input.value = val.replace(/\s/g, '')
            vm.$set(vm[formStr], key, input.value)
          } else if (vm && obj) {
            input.value = val.replace(/\s/g, '')
            vm.$set(obj, key, input.value)
          } else if (option && rowIndex !== undefined) {
            let data = option.data.filter(v => !v.invisible)
            input.value = val.replace(/\s/g, '')
            Vue.set(data[rowIndex], key, input.value)
          } else if (form && listStr && rowIndex !== undefined && vm) {
            input.value = val.replace(/\s/g, '')
            vm.$set(form[listStr][rowIndex], key, input.value)
          } else {
            input.value = val.replace(/\s/g, '')
            Vue.set(obj, key, val.replace(/\s/g, ''))
            // obj[key] = input.value = val.replace(/\s/g, '')
            // console.log(val)
            // console.log(val.replace(/\s/g, ''))
            // console.log(obj[key])
          }
        }, 100)
      }
      input.onblur = function () {
        if (this.value === '-') {
          input.value = ''
          if (vm && formStr) {
            vm.$set(vm[formStr], key, '')
          } else if (vm && obj) {
            vm.$set(obj, key, '')
          } else if (option && rowIndex !== undefined) {
            let data = option.data.filter(v => !v.invisible)
            Vue.set(data[rowIndex], key, '')
          } else if (form && listStr && rowIndex !== undefined) {
            vm.$set(form[listStr][rowIndex], key, input.value)
          } else {
            Vue.set(obj, key, '')
          }
        }
      }
    }
  },
  // unbind(el) {
  //   let input = el && el.querySelector('input')
  //   if (input) {
  //     input.oninput = () => { }
  //   }
  // }
}