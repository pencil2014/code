<template>
  <el-dialog title="编辑" :visible.sync="option.show" width="800px" :before-close="cancel">
    <el-form ref="form" :model="form" :rules="rules" inline label-width="80px" class="edit-form">
      <el-form-item label="姓名" prop="corpName">
        <el-input v-model="form.corpName" disabled></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input v-model="form.mobile" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" disabled></el-input>
      </el-form-item>
      <el-form-item label="用户群组" prop="groupCode">
        <el-select v-model="form.groupCode" placeholder="请选择">
        <el-option
          v-for="item in groupList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      </el-form-item>
      <el-form-item label="所属行业" prop="industry">
        <el-cascader
          filterable
          :clearable="true"
          size="mini"
          :options="this.cascaderList"
          v-model="form.industry"
          :props="{
            children: 'childList',
            label: 'industryCname',
            value: 'industryCname',
            checkStrictly: true
          }"
          placeholder="请选择所属行业"
          disabled
        ></el-cascader>
      </el-form-item>
      <el-form-item label="公司规模" prop="scale">
        <el-select v-model="form.scale" placeholder="请选择" disabled>
          <el-option
            v-for="item in dictMap['orgScale']"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="cancel" size="mini">取 消</el-button>
      <el-button type="primary" @click="submit" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { industryRelation } from '@/api/base'
import { corpSubmit, groupList } from '@/api/swcms/index'
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
        corpName: '',
        email: '',
        mobile: '',
        groupCode: '',
        industry: '',
        scale: '',
      },
      rules: {
        corpName: { required: true, message: ' ', trigger: 'change' },
        email: { required: true, message: ' ', trigger: 'change' },
        mobile: { required: true, message: ' ', trigger: 'change' },
        groupCode: { required: true, message: ' ', trigger: 'change' },
        industry: { required: true, message: ' ', trigger: 'change' },
      },
      cascaderList: [],
      groupList: []
    }
  },
  computed: {
		...mapGetters(['dictMap'])
	},
  created() {
    this.getIndustry()
    this.getGroup()
    Object.assign(this.form, this.option.data)
  },
  methods: {
    cancel() {
      this.$parent.editOption.show = false
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let { groupCode } = this.form
          let { memCorpId } = this.option.data
          let data = {
            memCorpId,
            groupCode
          }
          corpSubmit(data).then(res => {
            if (res.code === 0) {
              this.$msgSucClose('编辑用户成功!')
            }
            this.cancel()
            this.$parent.getData()
          }).catch(()=>{})
        } else {
          return false
        }
      })
    },
    // 群组下拉
    getGroup() {
      let data = {
        enable: 'yes'
      }
      groupList(data)
        .then((res) => {
          this.groupList = res.data.map((item) => {
            let { groupCname, groupCode } = item
            return {
              ...item,
              label: groupCname,
              value: groupCode,
            }
          })
        })
        .catch(() => {})
    },
    // 获取行业数据
    getIndustry () {
      industryRelation({}).then(res => {
        if (res.code === 0) {
          let base = this.getTreeData(res.data)
          this.cascaderList = [...base]
        }
      }).catch(()=>{})
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
  },
}
</script>

<style lang="scss" scoped>
.edit-form {
  display: flex;
  flex-wrap: wrap;
  /deep/ .el-form-item {
    flex-basis: 45%;
    margin-right: 0;
    display: flex;
    margin-bottom: 15px;
    .el-form-item__content {
      flex: 1;
      .el-select,.el-cascader{
        width: 100%;
      }
    }
  }
}
</style>
