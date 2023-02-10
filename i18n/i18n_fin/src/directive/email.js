export default {
  bind(el, binding) {
    let { value, obj, key } = binding.value
    // 规则写法一 let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/
    // 规则写法二 let reg = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/;
    // 规则写法三 let reg = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
    // 规则写法四 let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/
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