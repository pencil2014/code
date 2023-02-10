import { acBookList, sceneGroupList, voucherClassList, subjectList } from '@/api/fin/acct'
import { queryFeeItemList, feeItemClassList } from '@/api/fin/feeitem'

export const mixin = {
  data() {
    return {
      editOperate: [{ label: '修改', type: 'text', show: true, action: 'SingleEdit' }],
      delOperate: [{ label: '删除', type: 'text', show: true, action: 'Delete' }],
      detailOperate: [{ label: '详情', type: 'text', show: true, action: 'showDetail' }],
    }
  },
  methods: {
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      (this.tableOption || this.option1).pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      (this.tableOption || this.option1).pagination.currPage = val
      this.getData()
    },
    // 初始化搜索区数据 只需要手动设置columns，会自动生成data，省去手动设置data
    initSearchOption(columns) {
      let data = {}
      columns.forEach(column => {
        // 多级联动下拉搜索，添加_做为前缀区分
        // data[`${column.item ? '_' : ''}${column.prop}`] = column.item || ''
        // 改为配置时自己添加
        // column.req 设置req表示需要请求的参数，prop不一定请求，有展示作用
        data[column.req || column.prop] = column.item || ''
      })
      return { data, columns }
    },
    // 搜索
    search() {
      (this.tableOption || this.option1).pagination.currPage = 1
      let data = this.convertSearch((this.tableOption || this.option1), this.searchOption, true)
      // console.log(data.query);
      // if (!data || !data.query.length) {
      //   return this.$message({
      //     message: '至少填写一项内容',
      //     type: 'error',
      //     showClose: true,
      //   })
      // }
      this.getData(data)
    },
    // 格式化搜索请求
    convertSearch(table, search, fromSearch) {
      let data = {
        currPage: table.pagination.currPage,
        pageSize: table.pagination.pageSize,
        query: [],
      }
      // 新搜索组件时，直接返回
      if (search.addFilter) {
        let filterGroups = search.addFilter.filterGroups
        search.addFilter.searchInputGroup.forEach((item) => {
          let { key, value, range, req, valueReq } = item
          // 针对新增未选择要搜索的项，key为空字符串
          if (!key) return
          let filterKey = filterGroups[key]
          if (!filterKey) return
          let key0 = filterKey.keys && filterKey.keys[0]
          let key1 = filterKey.keys && filterKey.keys[1]
          if (range && (range.min || range.max)) {
            range.min && data.query.push({ column: key0 || key + 'Min', type: 'eq', value: range.min })
            range.max && data.query.push({ column: key1 || key + 'Max', type: 'eq', value: range.max })
            return
          }
          if (valueReq && item[valueReq]) {
            data.query.push({ column: valueReq, type: 'eq', value: item[valueReq] })
            return
          }
          if (value) {
            if (value instanceof Array) {console.log('value: ', value)
              if (value.length === 0) return
              if (['cascader', 'lsCascader'].includes(filterKey.type)) {
                if (filterKey.cascaderProps && filterKey.cascaderProps.multiple) {
                  data.query.push({ column: key, type: 'in', value: value.map(item => item[item.length - 1]).join(',') })
                } else {
                  data.query.push({ column: key, type: 'in', value: value[value.length - 1] })
                }
              } else if (filterKey.type === 'daterange' || key0) {
                data.query.push({ column: key0, type: 'eq', value: value[0] })
                data.query.push({ column: key1, type: 'eq', value: value[1] })
              } else {
                data.query.push({ column: key, type: 'in', value: value.join(',') })
              }
            } else {
              data.query.push({ column: key, type: filterKey.type === 'input' ? 'like' : 'eq', value: req || value })
            }
          }
        })
        console.log(data);
        return data
      }
      let obj = search.data
      // 如果是从search进来，需要判断是否有值
      if (fromSearch) {
        // 判断是否全部为空
        let watch = true;
        // console.log(obj);
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            if (element instanceof Array) {
              watch = false
            } else if (element instanceof Object) {
              if (element.min || element.max) watch = false
            } else if (element) {
              watch = false
            }
          }
        }
        // if (watch) return false;
        // 有值
      }
      search.columns.forEach(item => {
        if (item.noNeed) return;
        let { prop, req, type } = item;
        if (obj[prop] === '' || obj[prop] === undefined || obj[prop] === null) return;
        if (type === 'dateRange') {
          let voucher = prop === 'voucherDateRange'
          data.query.push({
            column: voucher ? 'startFinDate' : item.propArr[0],
            type: 'eq',
            value: obj[prop][0],
          })
          data.query.push({
            column: voucher ? 'endFinDate' : item.propArr[1],
            type: 'eq',
            value: obj[prop][1],
          })
        } else if (item.item) {
          if (item.item.min || item.item.max) {
            data.query.push({
              column: `start${prop}`,
              type: 'eq',
              value: item.item.min,
            })
            data.query.push({
              column: `end${prop}`,
              type: 'eq',
              value: item.item.max,
            })
          } else if (item.item.value) {
            if (item.item.type === 'range') {
              data.query.push({
                column: `${item.item.key}Start`,
                type: 'eq',
                value: item.item.value[0],
              })
              data.query.push({
                column: `${item.item.key}End`,
                type: 'eq',
                value: item.item.value[1],
              })
            } else {
              data.query.push({
                column: item.item.key,
                type: 'eq',
                value: item.item.value,
              })
            }
          }
        } else {
          data.query.push({
            column: req ? req[0] === '_' ? req.slice(1) : req : prop,
            type: item.type === 'input' ? 'like' : 'eq',
            value: obj[req] || obj[prop]
          })
        }
      });
      return data;
    },
    // 格式化请求参数 filters：arr 需要过滤掉的字段
    convertReq({ form, formItems }, filters) {
      // console.log(form, formItems);
      let obj = {}
      formItems.forEach(item => {
        let { req, prop } = item
        // 如果noReq字段为true表示不需要发送到后端 则返回进行下一个
        if (item.noReq) return
        // 如果req存在则请求req参数，
        // 如果req参数有下划线_,说明请求参数与prop相同，但是值不同，为了区分prop加下划线 
        // 如果form[item.req]没有值，则取绑定了值的form[item.prop]
        obj[req ? req[0] === '_' ? req.slice(1) : req : prop] = form[req] || form[prop]
      })
      //白名单 禁止过滤掉 ['oid'业务类型科目id|费用类型id,'acSubjectId'会计科目id,taxRateConfigId税率配置id,revision税率配置版本]
      let whiteList = ['oid', 'acSubjectId', 'acSceneId', 'taxRateConfigId', 'revision'];
      if (filters && filters.length) {
        whiteList = filters
      }
      whiteList.forEach(item => {
        if (form[item]) obj[item] = form[item]
      })
      return obj
    },
    // 添加成功后，清空弹框内的编辑内容
    clearAddDialog({ form }) {
      Object.keys(form).forEach(key => form[key] = form[key] == '*' ? '*' : '')
    },
    // 表格复选框
    sendMulti(data) {
      this.multipleSelection = data
      this.multipleSelection1 = data
    },
    // 单行编辑
    handleSingleEdit(row) {
      Object.assign(this.editDialog.form, row)
      // 需把本行内容传值  
      // 特殊的值
      // direction 对应字典 debitReditType
      // subMatchType 对应字典 voucherSubSubjectMatchType
      // 为form表单显示正确 feeCode显示feeName  feeitemFinGroup显示feeFinGroupName
      if (row.direction) this.editDialog.form.debitReditType = row.direction
      if (row.subMatchType) this.editDialog.form.voucherSubSubjectMatchType = row.subMatchType
      // if (row.feeName || row.feeCode) {
      //   this.editDialog.form.feeCode = row.feeName || (row.feeCode === '*' ? '*' : '')
      //   this.editDialog.form._feeCode = row.feeName && row.feeCode
      // }
      if (row.feeFinGroupName) {
        this.editDialog.form.feeFinGroup = row.feeFinGroup
        this.editDialog.form.feeitemFinGroup = row.feeFinGroupName
      }
      this.editDialog.show = true
    },

    // 获取账簿名称
    acBookList(queryString, cb) {
      let params = typeof queryString === 'object' ? queryString : { name: queryString, }
      return acBookList(params).then(({ data }) => {
        // return data.list.map(v => ({ ...v, value: v.acBookId, key: v.bookName, label: v.bookName }))
        let results = data.list.map(v => ({ ...v, value: v.bookName, key: v.bookName, label: v.bookName }))
        cb && cb(results)
        // console.log(results);
        return results
      })
    },
    // 获取凭证场景分组
    sceneGroupList(queryString, cb) {
      return sceneGroupList({ name: queryString, }).then(({ data }) => {
        return data.list.map(v => ({ ...v, value: v.acSceneGroupId, label: v.groupName }))
      })
    },
    // 获取凭证字列表
    voucherClassList(queryString, cb) {
      return voucherClassList({ name: queryString, }).then(({ data }) => {
        // return data.list.map(v => ({ ...v, value: v.code, label: v.name }))
        let results = data.list.map(v => ({ ...v, value: v.code, label: v.name, key: v.name }))
        cb && cb(results)
        return results
      })
    },
    // 获取会计科目列表 凭证配置-》对手科目编码 、现金交易对手科目
    // subjectList({ size, queryString },) {
    subjectList(queryString, cb, queryString2, item, keyValue) {
      let value = queryString, size = 30
      if (typeof queryString == 'object') {
        size = queryString.size
        value = queryString.queryString
      }
      let query = [{ column: 'subjectCode', type: 'default', value }]
      if (queryString2 && item) {
        query = [{ column: 'subjectName', type: 'default', value }]
      }
      return subjectList({ currPage: 1, pageSize: size, query }).then(({ data }) => {
        // return data.list.map(v => ({ ...v, value: v.subjectCode, label: v.subjectCode }))
        let results = data.list.map(v => ({ ...v, value: v.subjectCode, label: v.subjectCode }))
        cb && cb(results)
        if (item) {
          this.remoteSelectCommon(item, data.list, keyValue)
        }
        return results
      })
    },
    // 获取费用类别分类
    feeitemFinGroup() {
      return feeItemClassList({}).then(({ data }) => {
        return data.map(v => ({ ...v, label: v.cname, value: v.feeClassCode }))
      })
    },
    // 费用名称
    queryFeeItemList(params) {
      let data = {
        bizCode: params.businessType,
        receipayGroup: params.receipayType,
        serviceCode: params.serviceCode,
        name: params.queryString,
        size: params.size || 30
      }
      return queryFeeItemList(data).then(({ data }) => {
        return data.filter(v => v.operation !== 'add' || v.enabled !== 'no').map(v => ({ ...v, value: v.feeCode, label: v.feeName }))
      })
    },
  },
}
