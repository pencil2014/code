<template>
  <div class="organize-tree" :style="siteContentViewHeight">
    <div class="search-input">
      <el-input placeholder="请输入部门"  size="mini" prefix-icon="el-icon-search" v-model="filterText" clearable></el-input>
    </div>
    <el-tree :data="departmentList" :highlight-current="true" node-key="deptId" :props="defaultProps" :default-expand-all="false"  :filter-node-method="filterNode" ref="departmentTreeRef" :default-expanded-keys="idArr" @node-click="bindNodeClick" >
    </el-tree>
  </div>
</template>

<script>

import {departmentTreeList} from '@/api/companyResource'
let id = 1000;

export default {
  data() {
    return {
      // 树
      departmentList: [],
      defaultProps: {
        children: 'childList',
        label: 'deptCname'
      },
      idArr: [],
      filterText: '',
    };
  },
  computed: {
    siteContentViewHeight() {
      //浏览器高度减去top栏的高度
      var height = document.body.clientHeight -30
      return { minHeight: height + 'px' };
    }
  },
  watch: {
    filterText(val) {
      this.$refs.departmentTreeRef.filter(val);
    }
  },
 
  methods: {
    // 请求树的数据
    requestTreeData(data) {
      departmentTreeList(data).then(res=>{
          this.departmentList = JSON.parse(JSON.stringify(res.data));
          this.$refs.departmentTreeRef.setCurrentKey(1); 
          this.init();
       })
    },
    init() {
      if (this.departmentList) {
        // 默认展开第二级
        this.departmentList.forEach(m => {
          this.idArr.push(m.deptId);
        });
      }
    },
    // 搜索过滤
    filterNode(value, data) {
      if (!value) return true;
      return data.deptCname.indexOf(value) !== -1;
    },
   
  
    // 添加样式变化,高亮显示
    bindNodeClick(data, checked, indeterminate) {
      this.$emit('bindSelectData', data, checked, indeterminate, this.addSelectedOption);
    },
   
  }
};
</script>

<style lang="scss">
.organize-tree {
  float: left;
  margin-right: 10px;
  border: 1px solid #eee;
  background-color: rgb(249, 249, 249);
  overflow: auto;
  .el-tree {
    background-color: rgb(249, 249, 249);
  }
  .search-input {
    width: 100%;
    padding: 10px;
  }
  .el-tree-node__content {
    height: 36px;
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;
    }
    .el-tree-node__expand-icon {
      color: #222;
    }
    .el-tree-node__expand-icon.is-leaf {
      color: transparent;
      cursor: default;
    }

    &:hover {
      background-color: rgba($color: #6fbafe, $alpha: 0.3);
      color: #fff;
      .el-dropdown {
        color: #fff;
      }
      .el-tree-node__expand-icon {
        color: #fff;
      }
      .el-tree-node__expand-icon.is-leaf {
        color: transparent;
        cursor: default;
      }
    }
    .operation {
      display: none;
    }
  }

  .el-tree-node_bgc {
    background-color: #6fbafe !important;
    color: #fff;
    .operation {
      display: inline-block;
    }
    .el-dropdown,
    .el-tree-node__expand-icon {
      color: #fff;
    }
  }

  .el-cascader {
    width: 100%;
    .el-input {
      width: 100%;
    }
  }
}
.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
    background-color: #d6d8dd;
}
.organize-tree .el-tree-node__content:hover {
    background-color:#d6d8dd;
    color: #fff;
}
</style>
