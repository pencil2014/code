let searchTableUtil = {
    // 获取列表请求参数
    getListQuery(tableQuery, publishStatusQuery) {
        // 合并发布状态参数
        let data = {}
      if(publishStatusQuery){
        Object.assign(data, tableQuery, {
          query: tableQuery.query.concat(publishStatusQuery)
        })
      }else{
        Object.assign(data, tableQuery)
      }
      delete(data.state)
      return data
    },
    // 查询组件回调
    searchCallBack(action, searchInputGroup, filterGroups, tableConfig, tableQuery) {
      const defaultTableQuery = {
        columns: [],
        ascColumns: [],
        descColumns: [],
        query: [],     // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
        state: 'pass', // 订舱状态，默认显示审核通过
      }
      const defaultPage = {
        pageSize: 10,
        currPage: 1
      }
      const defaultSearchInputGroup = [
        {key: '', value: '', placeholder: '各类编号', category: 'numbers', queryValue: ''},
        {key: '', value: '', placeholder: '各类时间', category: 'times', queryValue: ''},
        {key: '', value: '', placeholder: '筛选类型', category: 'categorys', queryValue: ''},
      ]
      let query = []
      
      if (action === 'Search') {
        // 新增的查询条件组装tableQuery参数
        if (searchInputGroup.length) {
          searchInputGroup.forEach((item, index) => {
            let tempItem = {}
            // console.log(searchInputGroup)
            if (item.key) {
              // 非自动补全的查询参数从item.value中取值合并到query
              if (filterGroups[item.key].type !== 'autocomplete' ) {
                // 多选比如：中转港
								if (filterGroups[item.key].multiple) {
                  let value = item.value ? item.value.toString() : ''
                  if (filterGroups[item.key].valueAsLabelArr) {
                    value = filterGroups[item.key].valueAsLabelArr.toString()
                  }
									Object.assign(tempItem, {
										column: item.key,
										type: filterGroups[item.key].searchType || 'eq',
										value: value
                  })
                  // 中转港特殊处理
									if (item.key === 'transitPortCode') {
										Object.assign(tempItem, {
											column: 'transitPortCodeStr',
											type: 'like',
											value: item.value ? item.value.join('#') : ''
										})
									}
                } else if (filterGroups[item.key].valueAsLabelArr) {
                  Object.assign(tempItem, {
                    "column": item.key,
                    "type": filterGroups[item.key].searchType || 'eq',
                    "value": filterGroups[item.key].valueAsLabelArr.toString()
                  })
                }
                // 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
                else if (filterGroups[item.key].category === 'daterange' ) {
                  // if (item.value) query.push(
                  //   {column: item.key, type: "ge", value: item.value[0] + " 00:00:00"},
                  //   {column: item.key, type: "le", value: item.value[1] + " 23:59:59"}
                  // )
                  if (item.value && item.value[0]) {
                    if (item.value[0] === '-') {
                      query.push({
                        column: item.key,
                        type: 'empty',
                        value: '-'
                      })
                    } else {
                      query.push({
                        column: item.key,
                        type: 'ge',
                        value: item.value[0] + ' 00:00:00'
                      })
                    }
                  }
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
                } else {
                  Object.assign(tempItem, {
                    "column": item.key,
                    "type": filterGroups[item.key].searchType || 'eq',
                    "value": item.value
                  })
                }
              } else {
                Object.assign(tempItem, {
                  "column": item.key,
                  "type": filterGroups[item.key].searchType || 'eq',
                  "value": filterGroups[item.key].queryValue
                })
              }
              
              if (item.key === 'orderStatus') {
                this.tableQuery.orderStatus = item.value
              }
              query.push(tempItem)
            }

            // if (item.key) {

            //   Object.assign(tempItem, {
            //     "column": item.key,
            //     "type": filterGroups[item.key].searchType || 'eq'
            //   })

            //   // 非自动补全的查询参数从item.value中取值合并到query
            //   if (filterGroups[item.key].type !== 'autocomplete' ) {
            //     Object.assign(tempItem, {
            //       "value": item.value
            //     })
            //   }
              
            //   // 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
            //   if ( filterGroups[item.key].category === 'daterange' ) {
            //     let time = item.value ? item.value.toString() : ''
            //     Object.assign(tempItem, {
            //       "value": time
            //     })
            //   }

            //   // 自动补全的查询参数从item.queryvalue中取值合并到query
            //   if (filterGroups[item.key].type === 'autocomplete' ) {
            //     Object.assign(tempItem, {
            //       "value": item.queryValue
            //     })
            //   }

            //   query.push(tempItem)
            // }
          })
        }
        Object.assign(tableQuery, {
          query: query.filter(item => {
            return item.value
          }),
          currPage: 1
        })

        return {tableQuery}
      }

      if (action === 'Reset') {
        searchInputGroup = [...defaultSearchInputGroup]
        Object.assign(tableQuery, defaultTableQuery, {
          currPage: 1
        })
        Object.assign(tableConfig, {tips: {text: "", show: false}})
        return {tableQuery, tableConfig, searchInputGroup}
      }
    },
    // 过滤对象分类，按各种编号，各种时间，筛选类型分类
    filterObj(values, filterGroups) {
      const result = {}
      Object.keys(filterGroups).filter((key) => {
        return values.includes(key)
      }).forEach((key) => {
        result[key] = filterGroups[key]
      })
      
      return result
    },
}

export default searchTableUtil