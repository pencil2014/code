<!--
 * @Author: Sivan
 * @Date: 2022-05-30 14:21:26
 * @LastEditTime: 2022-05-31 11:50:05
 * @LastEditors: Sivan
-->
<template>
  <el-dialog
    :title="option.state === 'yes' ? '批量赋予角色' : '批量取消角色'"
    :visible.sync="option.show"
    width="1000px"
    @close="cancel"
    class="author-dialog"
  >
    <div class="author-cnt">
      <el-transfer
        :data="roleList"
        filterable
        class="transferCont"
        ref="customerTransfer"
        target-order="unshift"
        v-model="sysRoleIdList"
        :props="{ key: 'sysRoleId', label: 'roleName' }"
        :titles="transferTitle"
      >
      </el-transfer>
    </div>
    <div slot="footer">
      <el-button @click="cancel" size="mini">取消</el-button>
      <el-button type="primary" @click="submit" size="mini">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { roleSelectList, multiRoleAdd, multiRoleDelete } from '@/api/permission'
export default {
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      sysRoleIdList: [],
      roleList: [],
    }
  },
  created() {
    this.getRoleSelectList()
  },
  computed: {
    transferTitle () {
      return this.option.state === 'yes' ? ['可选角色', '赋予角色'] : ['可选角色', '取消角色']
    }
  },
  methods: {
    getRoleSelectList() {
      roleSelectList({ state: 'valid' })
        .then((res) => {
          if (res.code === 0) {
            this.roleList = res.data
          }
        })
        .catch(() => {})
    },
    cancel() {
      this.$parent.$data.addRoleOption.show = false
    },
    submit() {
      let len = this.sysRoleIdList.length
      if (!len) {
        return this.$msgErrClose('无角色数据变更，不用提交')
      }
      let { employeeIdList, state } = this.option
      let data = {
        employeeIdList,
        sysRoleIdList: this.sysRoleIdList,
      }
      let Method = state === 'yes' ? multiRoleAdd : multiRoleDelete
      let text = state === 'yes' ? '批量赋予角色成功' : '批量取消角色成功'
      Method(data)
        .then((res) => {
          if (res.code === 0) {
            this.cancel()
            this.$msgSucClose(text)
            this.$emit('refreshDataList')
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
.author-cnt {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.transferCont {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /deep/.el-transfer-panel {
    width: 380px !important;
    overflow: none;
  }
  /deep/ .el-transfer-panel__item.el-checkbox .el-checkbox__label {
    font-size: 12px;
    overflow: inherit !important;
  }
  /deep/ .el-transfer-panel .el-transfer-panel__header .el-checkbox .el-checkbox__label {
    font-size: 12px;
  }
  /deep/ .el-transfer__buttons .el-button--primary {
    background-color: #1890ff !important;
    border: 1px solid #1890ff !important;
  }
}
</style>
