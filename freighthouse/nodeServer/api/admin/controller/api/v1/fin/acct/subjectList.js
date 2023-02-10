module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "list": [{
                "acSubjectId": 1,
                "subjectName": 'name1',
                "fullName": "fullname",
                "subjectCode": "code1",
                "parentSubjectCode": "",
                "direction": "debit",
                "dimension": [
                    { "dimensionCode": '1', "isRequired": '', "seq": '1' },
                    { "dimensionCode": '2', "isRequired": '', "seq": '2' },
                ],
            }, {
                "acSubjectId": 2,
                "subjectName": 'name12',
                "fullName": "fullname",
                "subjectCode": "code2",
                "parentSubjectCode": "",
                "direction": "credit",
                "dimension": [
                    { "dimensionCode": '1', "isRequired": '', "seq": '1' },
                    { "dimensionCode": '2', "isRequired": '', "seq": '2' },
                ],
            }, {
                "acSubjectId": 3,
                "subjectName": 'name13',
                "fullName": "fullname",
                "subjectCode": "code3",
                "parentSubjectCode": "",
                "direction": "flat",
                "dimension": [
                    { "dimensionCode": '1', "isRequired": '', "seq": '1' },
                    { "dimensionCode": '2', "isRequired": '', "seq": '2' },
                ],
            },],
            "currPage": 1,
            "pageSize": 10,
            "totalCount": 1,
            "totalPage": 1
        },
        "msg": "success"
    }
}