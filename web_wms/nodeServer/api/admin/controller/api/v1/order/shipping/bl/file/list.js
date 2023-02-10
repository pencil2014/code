module.exports = (prams) => {
    return {
        "code":0,
        "msg":"success",
        "data":[
            {
                oid: '1',
                orderNo: '111',
                blId: '1',
                fileType: 'mbl_copy', //文件类型 （待细化类型，可能有草单确认件，MBLCopy件，船东费用单，OBD提单）
                fileNo: '1111',
                fileName: '文件名称.pdf',
                checkStatus: 'n', // 文件确认状态 y已确认,n未确认,null不需要该状态
                checkEmployeeId: 10,
                checkEmployeeName: '张三',
                checkTime: '2021-01-05 22:00:00',
                createdBy: 'xxx222',
                createdName: '角度看点点',
                createdTime: '2021-10-11 22:11:22',
            },
            {
                oid: '2',
                orderNo: '112',
                blId: '2',
                fileType: 'dn', //文件类型 （待细化类型，可能有草单确认件，MBLCopy件，船东费用单，OBD提单）
                fileNo: '1112',
                fileName: '文件名称2.doc',
                checkStatus: 'y', // 文件确认状态 y已确认,n未确认,null不需要该状态
                checkEmployeeId: 12,
                checkEmployeeName: '历史',
                checkTime: '2021-01-05 08:00:00',
                createdBy: 'xxx',
                createdName: '角度看',
                createdTime: '2021-10-11 22:11:22',
            }
        ]
    }
};
