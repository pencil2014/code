<template>
  <el-dialog
    :title="option.type === 'add' ? '新增兜底规则' : '编辑兜底规则'"
    :visible.sync="option.show"
    width="1100px"
    :before-close="cancel"
    v-loading="loading"
  >
    <el-form :model="form" ref="form" :rules="rules" inline size="mini" class="last-form">
      <p class="tips">( 价格请输入如 +100 或者 -100 )</p>
      <div class="price-box">
        <div class="item-box" v-for="(item, index) in form.priceList" :key="index">
          <div class="item">
            <el-form-item
              label="群组"
              :prop="`priceList.${index}.groupCode`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-select v-model="item.groupCode" placeholder="请选择" disabled>
                <el-option
                  v-for="(ele, index) in groupList"
                  :label="ele.label"
                  :value="ele.value"
                  :key="index"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="20GP"
              :prop="`priceList.${index}.gp20Add`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-input v-model="item.gp20Add" placeholder="请输入价格"></el-input>
            </el-form-item>
            <el-form-item
              label="40GP"
              :prop="`priceList.${index}.gp40Add`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-input v-model="item.gp40Add" placeholder="请输入价格"></el-input>
            </el-form-item>
            <el-form-item
              label="40HQ"
              :prop="`priceList.${index}.hq40Add`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-input v-model="item.hq40Add" placeholder="请输入价格"></el-input>
            </el-form-item>
            <el-form-item
              label="45HQ"
              :prop="`priceList.${index}.hq45Add`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-input v-model="item.hq45Add" placeholder="请输入价格"></el-input>
            </el-form-item>
          </div>
          <!-- <div class="btn-box">
            <i class="el-icon-circle-plus plus" v-if="index === 0" @click="addPrice"></i>
            <i class="el-icon-remove remove" v-else @click="removePrice(index)"></i>
          </div> -->
        </div>
      </div>
    </el-form>
    <div slot="footer">
      <el-button @click="cancel" size="mini">取 消</el-button>
      <el-button type="primary" @click="submit" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { priceRuleSave, groupList } from '@/api/swcms/index'
import { forecastDelete } from '@/api/bkg/bkgSaleConfig'
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      groupPriceRuleId: '',
      form: {
        priceList: [
          {
            groupCode: '',
            gp20Add: '',
            gp40Add: '',
            hq40Add: '',
            hq45Add: '',
          },
        ],
      },
      rules: {
        groupCode: { required: true, message: ' ', trigger: 'change' },
        gp20Add: { required: true, message: ' ', trigger: 'change' },
        gp40Add: { required: true, message: ' ', trigger: 'change' },
        hq40Add: { required: true, message: ' ', trigger: 'change' },
        hq45Add: { required: true, message: ' ', trigger: 'change' },
      },
      groupList: [],
      loading: false,
    }
  },
  created() {
    this.getGroup()
    if (this.option.type === 'edit') {
      let { groupPriceRuleId, memGroupCode:groupCode, gp20Add, gp40Add, hq40Add, hq45Add } = this.option.data
      this.groupPriceRuleId = groupPriceRuleId
      this.form.priceList = [
        {
          groupCode,
          gp20Add,
          gp40Add,
          hq40Add,
          hq45Add,
        },
      ]
    }
  },
  methods: {
    // 增加加价
    addPrice() {
      this.form.priceList.push({
        groupCode: '',
        gp20Add: '',
        gp40Add: '',
        hq40Add: '',
        hq45Add: '',
      })
    },
    removePrice(index) {
      this.form.priceList.splice(index, 1)
    },
    // 群组下拉
    getGroup() {
      let data = {
        currPage: 1,
        pageSize: 10,
        query: [],
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
          if (this.option.type === 'add') {
            this.form.priceList = this.groupList.map(ele => {
              return {
                groupCode: ele.value,
                gp20Add: '',
                gp40Add: '',
                hq40Add: '',
                hq45Add: '',
              }
            })
          }
        })
        .catch(() => {})
    },
    cancel() {
      this.$parent.lastOption.show = false
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let reg = /^(\-|\+)?\d+(\.\d+)?$/
          let status = this.form.priceList.some(item => {
            let { gp20Add, gp40Add, hq40Add, hq45Add } = item
            return !reg.test(gp20Add) || !reg.test(gp40Add) || !reg.test(hq40Add) || !reg.test(hq45Add)
          })
          if (status) {
            return this.$msgErrClose('价格输入不正确，请输入如+100 或 -100')
          }
          this.loading = true
          let data = {
            groupPriceRuleId: this.groupPriceRuleId,
            priceList: this.form.priceList,
            type: 'system'
          }
          priceRuleSave(data)
            .then((res) => {
              if (res.code === 0) {
                this.$parent.getData()
                this.cancel()
                let text = this.option.type === 'add' ? '新增兜底规则成功!' : '编辑兜底规则成功!'
                this.$msgSucClose(text)
              }
            })
            .catch(() => {})
            .finally(()=>{
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.tips{
  margin-top: -15px;
  color: #bbb;
  margin-bottom: 10px;
}
.last-form {
  /deep/.el-form-item {
    margin-right: 0;
    display: flex;
    align-items: center;
    .el-form-item__content {
      // flex: 1;
      .el-select {
        width: 100%;
      }
    }
  }
  .item-box {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .item {
      display: flex;
      flex: 1;
    }
  }
  .btn-box {
    width: 30px;
    text-align: right;
    i {
      font-size: 20px;
      cursor: pointer;
      &.plus {
        color: #1890ff;
      }
      &.remove {
        color: #999;
      }
    }
  }
  .el-form-item {
    width: 20%;
    margin-bottom: 0;
  }
}
</style>
