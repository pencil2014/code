export default {
  bind(el, binding) {
    let { value, obj, key } = binding.value
    // value email单个邮箱 emailMulti多个邮箱
    let reg = /[^a-zA-z0-9@\.]/g      //单个邮箱验证
    let regMulti = /[^a-zA-z0-9@\.,]/g  //多个邮箱验证
    let timeout = null
    let input = el.querySelector('input')
    input.addEventListener('input', function () {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        let val = this.value
        if ((value === 'email' && !reg.test(val)) || (value === 'emailMulti' && !regMulti.test(val))) {
          return
        }
        this.value = obj[key] = val.replace(value === 'email' ? reg : regMulti, '')
      }, 100)
    })
  }
}