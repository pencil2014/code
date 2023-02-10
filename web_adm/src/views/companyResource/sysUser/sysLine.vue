<!--
 * @Author: Sivan
 * @Date: 2022-06-22 17:46:40
 * @LastEditTime: 2022-06-22 19:09:50
 * @LastEditors: Sivan
-->
<template>
  <el-dialog title="系统航线配置" :visible.sync="option.show" width="800px" @close="cancel">
    <el-form :inline="true" ref="form" :model="form" label-width="80px" size="mini" class="form">
      <el-form-item label="大航线:" prop="bigLineCodes">
        <el-select
          v-model="form.bigLineCodes"
          placeholder="请选择"
          filterable
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in dictMap['dictGroupShipLine']"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="系统航线:" prop="sysLineCodes">
        <el-select
          v-model="form.sysLineCodes"
          placeholder="请选择"
          filterable
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in sysLine"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="cancel" size="mini">取消</el-button>
      <el-button type="primary" @click="submit" size="mini">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { baseSystemLineList } from '@/api/base'
import { userRelationSave, userRelationInfo } from '@/api/companyResource'
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        bigLineCodes: [],
        sysLineCodes: [],
      },
      sysLine: [],
    }
  },
  created() {
    this.getUserRelationInfo()
    this.getSysLine()
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  methods: {
    getSysLine(str = '') {
      baseSystemLineList('', 'valid')
        .then((res) => {
          this.sysLine = res.data.map((ele) => {
            let { cname, sysLineCode } = ele
            return {
              label: cname,
              value: sysLineCode,
            }
          })
        })
        .catch(() => {})
    },
    getUserRelationInfo() {
      let { employeeId } = this.option
      let data = {
        employeeId,
      }
      userRelationInfo(data)
        .then((res) => {
          if (res.code === 0) {
            let { bigLineCodes, sysLineCodes } = res.data
            this.form.bigLineCodes = bigLineCodes || []
            this.form.sysLineCodes = sysLineCodes || []
          }
        })
        .catch(() => {})
    },
    submit() {
      let { employeeId } = this.option
      let {} = this.form
      let data = {
        employeeId,
        ...this.form
      }
      userRelationSave(data)
        .then((res) => {
          if (res.code === 0) {
            this.cancel()
            this.$msgSucClose('配置系统航线成功')
            this.$emit('refreshDataList')
          }
        })
        .catch(() => {})
    },
    cancel() {
      this.$parent.$data.sysLineOption.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-wrap: wrap;
  .el-form-item {
    width: 50%;
    margin-right: 0;
    display: flex;
    /deep/ .el-form-item__content {
      flex: 1;
      .el-select {
        width: 100%;
      }
      .el-input--mini .el-input__inner {
        height: 20px !important;
        line-height: 20px !important;
      }
    }
  }
}
</style>
