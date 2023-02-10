
// let language = 'en' || (navigator.language || navigator.browserLanguage).toLowerCase() // 暂用'en'
let locale = localStorage.getItem('locale')
let language = locale ? locale.split('-')[0] : 'en'
export default language