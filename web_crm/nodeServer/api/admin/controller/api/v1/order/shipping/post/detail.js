
module.exports = (prams) => {
  return {
    "code":0,
    "msg":"success",
    "data":{
      "blList": [],
      "businessType": "ship_export_fcl",
      "expressNo": "123456789",
      "expressSupplierId": "1",
      "expressSupplierName": "顺丰",
      "expressType": "foreign",
      "grtList": [],
      "postId": 2,
      "postOrderList": {
        "hello_003": {
          "blList": [
            {
              "blNo": "M001",
              "blType": "mbl",
              "oid": 2,
              "orderNo": "hello_003",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "blNo": "H001",
              "blType": "hbl",
              "oid": 3,
              "orderNo": "hello_003",
              "postId": 0,
              "selectedStatus": 2
            }
          ],
          "guaranteeDocumentList": [
            {
              "docName": "产地证",
              "docNo": "doc123",
              "docType": "trade",
              "oid": 0,
              "orderNo": "hello_003",
              "postId": 2,
              "selectedStatus": 1
            }
          ],
          "tradeDocumentList": [
            {
              "docName": "产地证1",
              "docNo": "doc123",
              "docType": 'trade',
              "oid": 2,
              "orderNo": "hello_003",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "产地证2",
              "docNo": "doc1234",
              "docType": 'trade',
              "oid": 3,
              "orderNo": "hello_003",
              "postId": 0,
              "selectedStatus": 2
            }
          ]
        },
        "hello_004": {
          "blList": [
            {
              "blNo": "M002",
              "blType": "MBL",
              "oid": 2,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "blNo": "H002",
              "blType": "HBL",
              "oid": 3,
              "orderNo": "hello_004",
              "postId": 0,
              "selectedStatus": 0
            }
          ],
          "guaranteeDocumentList": [
            {
              "docName": "SWB",
              "docNo": "doc1241",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "倒签预借顺签保函",
              "docNo": "doc1242",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "改单保函",
              "docNo": "doc1243",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "账单",
              "docNo": "doc1244",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "HBL",
              "docNo": "doc1245",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "MBL",
              "docNo": "doc1246",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            }
          ],
          "tradeDocumentList": [
            {
              "docName": "HBL船贸",
              "docNo": "doc1231",
              "docType": 'trade',
              "oid": 2,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "HBL船证",
              "docNo": "doc1232",
              "docType": 'trade',
              "oid": 3,
              "orderNo": "hello_004",
              "postId": 0,
              "selectedStatus": 0
            },
            {
              "docName": "保单",
              "docNo": "doc12333",
              "docType": 'trade',
              "oid": 2,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "货运险业务倒签保函",
              "docNo": "doc12334",
              "docType": 'trade',
              "oid": 2,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "产地证FROM",
              "docNo": "doc12335",
              "docType": 'trade',
              "oid": 3,
              "orderNo": "hello_004",
              "postId": 0,
              "selectedStatus": 0
            }
          ]
        }
      },
      "postTime": "2020-09-16 14:52:27",
      "postType": "post",
      "postUser": "小浪儿",
      "receiveAddress": "南山科技园",
      "receiveCompany": "腾讯",
      "receiveCompanyId": "1",
      "recipient": "小三",
      "recipientPhone": "13480690609",
      "sendAddress": "罗湖黄贝岭",
      "sendCompany": "长帆",
      "sendCompanyId": "2",
      "sender": "俊儿",
      "senderPhone": "13480691609",
      "signTime": "2020-09-16 14:52:40",
      "signUser": "前台",
      "status": "signed",
      "tradeList": []
    }
  }
};
