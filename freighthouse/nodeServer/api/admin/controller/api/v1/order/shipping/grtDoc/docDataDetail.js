const trade = {
  blNo: 's1',
  vessle: '欧阳',
  voyage: '11',
  shippingState: '美国',
  creditNo: 'fdsa',
  ticketDate: '2020-09-08',
  issuingBank: '桃花岛',
  createdName: '鹏鹏',
  createTime: '2020-09-09',
  updateName: '鹏鹏',
  updateTime: '2020-09-11'
}
const certificate = {
  blNo: 's1',
  vessle: '欧阳',
  voyage: '11',
  issueTime: '2020-09-08',
  declareTime: '2020-09-09',
  createdName: '鹏鹏',
  createTime: '2020-09-09',
  updateName: '鹏鹏',
  updateTime: '2020-09-11'
}
const guarantee = {
  polCode: 'ESCAR',
  polName: 'CARTAGENA(卡塔赫纳)',
  podCode: 'PYTER',
  podName: 'TERPORT(特尔港)',
  productNameEn: '11',
  contractNo: 'ss-jfkds121',
  departureTime: '2020-09-08',
  insureName: '加捻',
  insureNo: 'jkj-qweq',
  createdName: '鹏鹏',
  createTime: '2020-09-09',
  updateName: '鹏鹏',
  updateTime: '2020-09-11'
}
const from = {
  certificateNo: 'c1203',
  projectNo: 'p-2132',
  exporterName: '土地',
  exporterAddress: '佛第三款',
  exporterCountry: '美国',
  manufacturerName: '彭彭',
  manufacturerAddress: '深圳防静电',
  manufacturerCountry: '中国',
  receiverName: 'wer',
  receiverAddress: '发动机考试辅导',
  receiverCountry: '法国',
  importerName: '放得开',
  importerAddress: '发的开始',
  importerCountry: '美国',
  departureTime: '2020-09-08 11:00:00',
  vessel: '流浪者',
  voyage: '12',
  polCode: 'ESCAR',
  polName: 'CARTAGENA(卡塔赫纳)',
  podCode: 'PYTER',
  podName: 'TERPORT(特尔港)',
  realEstate: '放得开',
  goodsIssuePlace: '福建快科技',
  goodsIssueDate: '2020-09-09 09:20:00',
  certAuthorityAddress: 'xxxxx',
  certAuthorityPhone: '18922228921',
  certAuthorityFax: '1827899232',
  certAddress: 'yyyyyyy',
  certDate: '2020-06-05 12:20:30',
  tariffItemNo: 't-2313421',
  transportTerm: '海运'
}
module.exports = (prams) => {
  return {
    "code":0,
    "msg":"success",
    "data":{
      "createdBy": 0,
      "createdName": "",
      "createdTime": null,
      "docData": JSON.stringify(guarantee),
      "docId": 1,
      "oid": 1,
      "revision": 1,
      "state": "valid",
      "updatedBy": 0,
      "updatedName": "",
      "updatedTime": null
    }
  }
};
