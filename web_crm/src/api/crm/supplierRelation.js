import request from "@/utils/request";
//关系列表
export function list(data) {
  return request({
    url: "crm/supplier/relation/list",
    method: "post",
    data,
  });
}
//关系保存
export function save(data) {
  return request({
    url: "crm/supplier/relation/save",
    method: "post",
    data,
  });
}
// 关系删除
export function del(data) {
  return request({
    url: "crm/supplier/relation/delete",
    method: "post",
    data,
  });
}
