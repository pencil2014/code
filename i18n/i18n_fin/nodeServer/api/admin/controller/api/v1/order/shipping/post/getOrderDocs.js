module.exports = (prams) => {
  return {
    "code":0,
    "msg":"success",
    "data":{
      "blList": [
        {
            "blNo": "M001",
            "blType": "mbl",
            "oid": 2,
            "orderNo": "hello_003",
            "postId": 0,
            "selectedStatus": 2
        },
        {
            "blNo": "H001",
            "blType": "hbl",
            "oid": 3,
            "orderNo": "hello_003",
            "postId": 0,
            "selectedStatus": 0
        }
      ],
      "guaranteeDocumentList": [],
      "tradeDocumentList": [
        {
            "docName": "产地证",
            "docNo": "doc123",
            "docType": "trade",
            "oid": 0,
            "orderNo": "hello_003",
            "postId": 0,
            "selectedStatus": 2
        },
        {
            "docName": "产地证",
            "docNo": "doc1231",
            "docType": "trade",
            "oid": 0,
            "orderNo": "hello_003",
            "postId": 0,
            "selectedStatus": 0
        }
      ]
    }
  }
};
