// 在线office预览
export function officePreview (row) {
  let { fileNo, name } = row // 文件对象提取fileNo、name
  name = name.replace(/[\[|\]|\{|\}|\%|`]/g, '') //文件名称去除特殊字符
  let locationHref = window.location.href //获取本地href
  let onlinePreview = locationHref.includes('oss.longsailing.net') || locationHref.includes('81.71.10.108') //线上域名、IP检测
  let reg = /(.*)\.(xls|XLS|xlsx|XLSX|doc|DOC|docx|DOCX|PPT|PPTX|ppt|pptx)$/ //office后缀正则
  let isOffice = reg.test(name) //office检测
  // 线上doc、xls、ppt文件走office预览流程
  if (onlinePreview && isOffice) {
    let href = `https://oss.longsailing.net/base/fileView/preview/${fileNo}/${name}`
    window.open(`http://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(href)}`,'_blank')
  } else {
  // 其他文件或者本地环境走本地下载流程
    let href = `/base/fileView/preview/${fileNo}/${name}`
    window.open(href)
  }
  // 本地测试数据
  // let href = 'http://oss.longsailing.net/test1111.xlsx'
  // window.open(`http://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(href)}`,'_blank')
}
