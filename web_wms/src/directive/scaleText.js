export default {
  inserted(el){
    let parentNode = el.parentNode
    let selfWidth = el.offsetWidth
    let parentWidth = parentNode.offsetWidth
    let scale = parentWidth / selfWidth
    if (scale < 1) {
      el.style.transform = `scale(${scale})`
    } else {
      el.style.transform = `scale(1)`
    }
  },
  componentUpdated(el, binding) {
    // console.dir(el.offsetWidth);
    let parentNode = el.parentNode
    let selfWidth = el.offsetWidth
    let parentWidth = parentNode.offsetWidth
    let scale = parentWidth / selfWidth
    if (scale < 1) {
      // console.log('scale actived', scale);
      // console.log(parentWidth, selfWidth);
      el.style.transform = `scale(${scale})`
      // console.log(el);
    }else{
      el.style.transform = `scale(1)`
    }
  }
}