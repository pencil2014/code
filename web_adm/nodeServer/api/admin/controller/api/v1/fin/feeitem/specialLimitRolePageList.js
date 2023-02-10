module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "allColumns": [
      ],
      "configColumns": [
      ],
      "currPage": 1,
      "list": [
        {
          "oid": 9,
          "revision": 0,
          "roleCode": "KDRART",
          "roleName": "超级管理员",
          "feeItems": [
            {
              "feeCode": "DXF",
              "feeEnName": "RE-STUFFING CHARGE",
              "feeName": "倒箱费"
            }
          ],
          "enabled": "yes"
        },
        {
          "oid": 9,
          "revision": 02,
          "roleCode": "KDRART",
          "roleName": "超级管理员2",
          "feeItems": [
            {
              "feeCode": "DXF",
              "feeEnName": "RE-STUFFING CHARGE",
              "feeName": "倒箱费"
            }
          ],
          "enabled": "no"
        }
      ],
      "pageSize": 10,
      "totalCount": 3,
      "totalPage": 1
    },
    "msg": "success"
  }
}
// 返回参数说明
// 参数名	必选	类型	说明
// roleName	Y	Int	角色名称
// revision	Y	Int	数据版本号
// feeItems	Y	Array	费用项名称
// enabled	Y	String	是否启用
// 返回参数feeItems说明
// 参数名	必选	类型	说明
// feeCode	Y	String	费用项编码
// feeEnName	Y	String	费用项英文名
// feeName	Y	String	费用项名称