<template>
  <div class="approval-org-tree" :style="siteContentViewHeight">
    <div class="search-input">
      <el-input placeholder="请输入"  size="mini" prefix-icon="el-icon-search" v-model="filterText" clearable></el-input>
    </div>
    <el-tree :data="departmentList" :highlight-current="true" node-key="oid" :props="defaultProps" :default-expand-all="false"  :filter-node-method="filterNode" ref="departmentTreeRef" :default-expanded-keys="idArr" @node-click="bindNodeClick" >
    </el-tree>
  </div>
</template>

<script>

import { approvalOrgList } from '@/api/order/contract'
let id = 1000;

export default {
  data() {
    return {
      // 树
      departmentList: [],
      defaultProps: {
        children: 'childList',
        label: 'orgName'
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
    requestTreeData() {
      approvalOrgList().then(res=>{
        this.departmentList = JSON.parse(JSON.stringify(res.data));
        this.$refs.departmentTreeRef.setCurrentKey(1); 
        this.init();
      })
    },
    init() {
      if (this.departmentList) {
        // 默认展开第二级
        this.departmentList.forEach(m => {
          this.idArr.push(m.oid);
        });
      }
    },
    // 搜索过滤
    filterNode(value, data) {
      if (!value) return true;
      return data.orgName.indexOf(value) !== -1;
    },
   
  
    // 添加样式变化,高亮显示
    bindNodeClick(data, checked, indeterminate) {
      this.$emit('bindSelectData', data, checked, indeterminate);
    },
   
  }
};
</script>

<style lang="scss" scoped>
.approval-org-tree {
  float: left;
  margin-right: 10px;
  border: 1px solid #eee;
  background-color: rgb(249, 249, 249);
  overflow: auto;
  /deep/.el-tree {
    background-color: rgb(249, 249, 249);
  }
  .search-input {
    width: 100%;
    padding: 10px;
  }
  /deep/ .el-tree-node__content {
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
      background-color:#d6d8dd;
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

  /deep/ .el-tree-node_bgc {
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

  /deep/.el-cascader {
    width: 100%;
    .el-input {
      width: 100%;
    }
  }
}
/deep/.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
  background-color: #d6d8dd;
}
</style>
