import request from '@/utils/request'

const RELATION = {}
const arr = [
  'csnList',  //客户关系收发通列表
  { api: 'relationship', path: 'custStruct/relationship' }, //客户关系母子公司
  { api: 'structDelete', path: 'custStruct/delete' }, //客户关系删除母子公司
  { api: 'addRelationship', path: 'custStruct/add'}, // 客户关系保存母子公司
  { api: 'uploadOrReplace', path: 'custStruct/attachment/uploadOrReplace' }, //更换母子财务附件
  { api: 'uploadOrReplaceRelation', path: 'custRelation/attachment/uploadOrReplace' }, //更换平级财务附件
  // 'relationship',  //客户关系母子公司
  'show', //客户关系关联公司
  'checkAdd', //检查客户是否可以添加关联公司
  'delete', //客户关系删除关联公司
  'submit', // 关联关系新增
  'list', // 关联关系列表
  'update', //关联关系编辑
  { api: 'custStructCheck', path: 'custStruct/checkAdd' }, //检查是否可以添加母子公司
  'add', //客户关系保存平级关系
  { api: 'verifyRefuse', path: 'custRelation/verify/refuse'},
  { api: 'verifyPass', path: 'custRelation/verify/pass'},
]
arr.forEach((api) => {
  RELATION[api.api || api] = (data) => request({
    url: `/crm/${api.path || 'custRelation/' + api}`,
    method: 'post',
    data
  })
})
export default RELATION
