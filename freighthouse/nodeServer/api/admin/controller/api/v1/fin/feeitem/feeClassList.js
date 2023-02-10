module.exports = (params) => {
  return {
    "code": 0,
    "data": [
      {
        // "feeClassCode": "分类编码",
        // "cname": "分类中文名",
        // "ename": "分类英文名",
        // "toVoucher": "是否生成转字凭证",
        // "toBill": "是否参与对账",
        // "remark": "备注"
        "feeClassCode": "1",
        "cname": "cn1",
        "ename": "en1",
        "toVoucher": "yes",
        "toBill": "yes",
        "remark": "备注"
      },
      {
        "feeClassCode": "2",
        "cname": "cn2",
        "ename": "en2",
        "toVoucher": "no",
        "toBill": "no",
        "remark": "备注"
      },
    ],
    "msg": "success"
  }
}