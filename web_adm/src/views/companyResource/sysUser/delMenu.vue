<!--
 * @Author: Sivan
 * @Date: 2022-05-30 11:06:30
 * @LastEditTime: 2022-06-06 11:08:30
 * @LastEditors: Sivan
-->
<template>
  <el-dialog title="用户权限排除" :visible.sync="option.show" width="1200px" @close="cancel">
    <div class="dialog-cnt">
      <div class="title">
        <DetailDiv label="系统登录账号:" :content="option.loginAccount" />
        <DetailDiv label="员工姓名:" :content="option.roleName" />
        <DetailDiv label="岗位:" :content="option.deptRole" :isTooltip="true" />
        <DetailDiv label="角色:" :content="option.roleName" :isTooltip="true" />
      </div>
      <div class="model">
        <label for="" class="model">模块: </label>
        <el-select
          v-model="sysAuthorityId"
          value-key=""
          placeholder=""
          clearable
          filterable
          @change="changeModule"
          size="mini"
          class="model-select"
        >
          <el-option
            v-for="(o, key) in moduleOptions"
            :key="key"
            :label="o.menuName"
            :value="o.sysAuthorityId"
          >
          </el-option>
        </el-select>
      </div>
      <el-transfer
        :data="resourceData"
        filterable
        class="transferCont"
        ref="customerTransfer"
        target-order="unshift"
        v-model="allSysAuthorityIds"
        :props="{ key: 'sysAuthorityId', label: 'resourceName' }"
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
import { listLevel2Menu, userExcludeAuthorityList, listExcludeSubResource, saveUserExcludeResource } from '@/api/permission'
export default {
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      sysAuthorityId: '',
      moduleOptions: [],
      resourceData: [],
      soureData: [],
      allSysAuthorityIds: [],
      transferTitle: ['已选权限', '排除权限'],
    }
  },
  created() {
    this.loanBasicData()
  },
  methods: {
    loanBasicData() {
      //获取模块下拉数据
      listLevel2Menu().then(res=>{
        this.moduleOptions = res.data || []
      })
      // 获取排除权限
      this.getAuthorityList()
      // 加载全部权限
      this.changeModule()
    },
    getAuthorityList () {
      userExcludeAuthorityList({ employeeId: this.option.employeeId }).then((res) => {
        if (res.code === 0) {
          this.allSysAuthorityIds = res.data?.map(item => item.sysAuthorityId) || []
        }
      })
    },
    changeModule (sysAuthorityId = '') {
      listExcludeSubResource({sysAuthorityId, employeeId: this.option.employeeId}).then(res=>{
        this.resourceData = res.data || []
        // 保存全部权限数据
        if (!sysAuthorityId) {
          this.soureData = res.data
        } else {
          let sysAuthorityIds = res.data.map(item => item.sysAuthorityId)
          this.allSysAuthorityIds.forEach(ele => {
            if (!sysAuthorityIds.includes(ele)) {
              let option = this.soureData.find(i => i.sysAuthorityId === ele)
              this.resourceData.push(option)
            }
          })
        }
      })
    },
    submit() {
      let data = {
        employeeId: this.option.employeeId,
        sysAuthorityIds: this.allSysAuthorityIds
      }
      saveUserExcludeResource(data)
        .then((res) => {
          if (res.code === 0) {
            this.cancel()
            this.$msgSucClose('排除权限成功')
            this.$emit('refreshDataList')
          }
        })
        .catch(() => {})
    },
    cancel() {
      this.$parent.$data.delMenuOption.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog-cnt {
  .title{
    display: flex;
  }
  .model {
    label {
      font-weight: 500;
      display: inline-block;
      width: 45px;
      text-align: right;
      margin-right: 5px;
    }
    .model-select {
      width: 410px;
    }
  } 
}
.transferCont {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px;
  /deep/.el-transfer-panel {
    width: 450px !important;
    overflow: none;
  }
  /deep/ .el-transfer-panel__item.el-checkbox .el-checkbox__label {
    font-size: 12px;
    overflow: inherit !important;
  }
  /deep/ .el-transfer-panel .el-transfer-panel__header .el-checkbox .el-checkbox__label{
    font-size: 12px;
  }
  /deep/ .el-transfer__buttons .el-button--primary {
    background-color: #1890ff !important;
    border: 1px solid #1890ff !important;
  }
}
</style>
