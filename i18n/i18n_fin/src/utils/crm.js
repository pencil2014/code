
/**
 * @description: 转换所属行业格式
 * @param {*} str 
 * @return {*}
 * @author: yinjunying
 * @Date: 2022-06-14 11:32:10
 */
export function formatIndustry (str) {
  if (str) {
    if (str.includes('[')) {
      let val = JSON.parse(str)
      if (val.length > 1) {
        return JSON.parse(str).join("/")
      } else {
        return JSON.parse(str).join("")
      }
    } else {
      return str
    }
  } else {
    return ''
  }
}