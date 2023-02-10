import store from '@/store'

export function setDialStyAmend(to) {
  let ELDIALOGAMEND = document.getElementById('el-dialog-amend')
  let dialFullScreen = to && to.meta.dialFullScreen
  let dialFullWidth = to && to.meta.dialFullWidth
  // let modules = ['finance', 'crm']
  // if (to) {
  //   let isNotEffect = modules.every(item => {
  //     return !to.path.startsWith('/' + item.toLowerCase())
  //   })
  //   if (isNotEffect) dialFullWidth = true
  // } else {
  //   dialFullWidth = true
  // }
  let tPH = dialFullScreen ? 0 : store.state.app.tPartHeight
  let sPW = (dialFullScreen || dialFullWidth) ? 0 : store.state.app.sPartWidth
  if (!ELDIALOGAMEND) {
    let STYLE = document.createElement('style')
    STYLE.type = 'text/css'
    STYLE.id = 'el-dialog-amend'
    STYLE.innerHTML = 
      `.el-dialog__wrapper,.el-message-box__wrapper{top: ${tPH}px;left: ${sPW}px;}.v-modal{top: ${tPH}px;left: ${sPW}px;width: calc(100% - ${sPW}px);height: calc(100% - ${tPH}px);opacity: 0.5;}`
    document.head.appendChild(STYLE)
  } else {
    ELDIALOGAMEND.innerHTML = 
      `.el-dialog__wrapper,.el-message-box__wrapper{top: ${tPH}px;left: ${sPW}px;}.v-modal{top: ${tPH}px;left: ${sPW}px;width: calc(100% - ${sPW}px);height: calc(100% - ${tPH}px);opacity: 0.5;}`
  }
}