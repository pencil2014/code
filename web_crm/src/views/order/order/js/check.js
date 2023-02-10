import { Message } from 'element-ui'
export function canEnter (checkList = []) {
  let check = true
  let len = checkList.length
  if (len) {
    let num = 54
    let rowArr = []
    for(let i = 0; i < len; i++) {
      let val = checkList[i].value
      let text = checkList[i].text
      if (val) {
        let arr1 = val.split('\n')
        let len1 = arr1.length
        for(let j = 0; j < len1; j++) {
          let arr2 = arr1[j].split(' ')
          if(arr2.some(item2 => item2 && (item2.length > num))) {
            check = false
            rowArr.push(j+1)
          }
        }
        !check && Message.error(`${text}第${rowArr.join(',')}行长度超过${num},请手动换行`)
        if (!check) break
      }
    }
  }
  return check
}