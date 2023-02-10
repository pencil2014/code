module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "list": [{
                "acSceneGroupId": 1,
                "groupName": "aaaa",
                "groupRemark": ""
            }, {
                "acSceneGroupId": 2,
                "groupName": "bbbb",
                "groupRemark": ""
            },],
            "currPage": 1,
            "pageSize": 10,
            "totalCount": 1,
            "totalPage": 1
        },
        "msg": "success"
    }
}
// acSceneGroupId	int	凭证场景分组id
// groupName	int	分组名称
// groupRemark	string	分组名称描述