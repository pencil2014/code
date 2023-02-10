<template>
  <el-dialog
    :title="option.type === 'add' ? '新增加价规则' : '编辑加价规则'"
    :visible.sync="option.show"
    width="1100px"
    :before-close="cancel"
    v-loading="loading"
  >
    <el-form
      :model="form"
      :rules="rules"
      inline
      ref="form"
      size="mini"
      label-width="60px"
      class="add-form"
    >
      <div class="title">基本信息</div>
      <div class="base-box">
        <el-form-item label="目的港" prop="podCode">
          <el-select
            v-model="form.podCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="portSearch"
            @change="changePodCode"
            value-key="portCode"
          >
            <el-option
              v-for="item in podPortList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="国家" prop="podCountryCode">
          <el-select
            v-model="form.podCountryCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="countryQuerySearch"
          >
            <el-option
              v-for="item in countryList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="航线" prop="sysLineCode">
          <el-select
            v-model="form.sysLineCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="sysLineQuerySearchList"
            :disabled="disSysLine" 
          >
            <el-option
              v-for="item in sysLineList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="船司" prop="shipCarrierCode">
          <el-select
            v-model="form.shipCarrierCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="shipQuerySearch"
          >
            <el-option
              v-for="item in shipList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="title">群组价格 <span class="tips">( 价格请输入如 +100 或者 -100 )</span></div>
      <div class="price-box">
        <div class="item-box" v-for="(op, i) in form.priceList" :key="i">
          <div class="item">
            <el-form-item
              label="群组"
              :prop="`priceList.${i}.groupCode`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-select v-model="op.groupCode" placeholder="请选择" clearable disabled>
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
              :prop="`priceList.${i}.gp20Add`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-input v-model="op.gp20Add" placeholder="请输入价格"></el-input>
            </el-form-item>
            <el-form-item
              label="40GP"
              :prop="`priceList.${i}.gp40Add`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-input v-model="op.gp40Add" placeholder="请输入价格"></el-input>
            </el-form-item>
            <el-form-item
              label="40HQ"
              :prop="`priceList.${i}.hq40Add`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-input v-model="op.hq40Add" placeholder="请输入价格"></el-input>
            </el-form-item>
            <el-form-item
              label="45HQ"
              :prop="`priceList.${i}.hq45Add`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }"
            >
              <el-input v-model="op.hq45Add" placeholder="请输入价格"></el-input>
            </el-form-item>
          </div>
          <!-- <div class="btn-box">
            <i class="el-icon-circle-plus plus" v-if="i === 0" @click="addPrice"></i>
            <i class="el-icon-remove remove" v-else @click="removePrice(i)"></i>
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
import { countrySelectList } from '@/api/base'
import { priceRuleSave, groupList } from '@/api/swcms/index'
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
        groupPriceRuleId: '',
        podCode: '',
        podCountryCode: '',
        sysLineCode: '',
        shipCarrierCode: '',
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
        sysLineCode: { required: true, message: ' ', trigger: 'change' },
      },
      groupList: [],
      podPortList: [],
      shipList: [],
      sysLineList: [],
      countryList: [],
      disSysLine: false,
      loading: false
    }
  },
  created() {
    this.getGroup()
    if (this.option.type === 'edit') {
      let {
        groupPriceRuleId,
        memGroupCode: groupCode,
        gp20Add,
        gp40Add,
        hq40Add,
        hq45Add,
        podCode,
        podCountryCode,
        sysLineCode,
        shipCarrierCode,
      } = this.option.data
      Object.assign(this.form, {
        groupPriceRuleId,
        podCode,
        podCountryCode,
        sysLineCode,
        shipCarrierCode,
        priceList: [
          {
          groupCode,
          gp20Add,
          gp40Add,
          hq40Add,
          hq45Add,
        },
        ]
      })
      this.portSearch(podCode)
      this.countryQuerySearch(podCountryCode)
    }
  },
  methods: {
    changePodCode(val) {
      if (!val) {
        this.disSysLine = false
      } else {
        let find = this.podPortList.find(item => item.value === val)
        let { countryCode, sysLineCode } = find
        Object.assign(this.form, { podCountryCode: countryCode, sysLineCode })
        this.disSysLine = true
        this.countryQuerySearch(countryCode)
        if (!this.sysLineList.length) {
          this.sysLineQuerySearchList('')
        }
      }
    },
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
        enable: 'yes',
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
    // 远程搜索港口下拉数据 port_of_basic  port_of_destination
    portSearch(queryString) {
      let data = {
        queryString,
        portAttribute: 'port_of_destination',
        state: 'valid'
      }
      this.$store.dispatch('dict/basePortList', data).then((data) => {
        this.podPortList = data.map((item) => {
          return {
            ...item,
            label: item.value,
            value: item.portCode,
          }
        })
      })
    },
    // 航线
    sysLineQuerySearchList(queryString) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: 'valid' })
        .then((data) => {
          this.sysLineList = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key,
            })
          })
        })
    },
    // 船公司
    shipQuerySearch(queryString) {
      this.$store
        .dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' })
        .then((data) => {
          this.shipList = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key,
            })
          })
        })
    },
    // 国家
    countryQuerySearch(queryString) {
      let data = {
        countryCode: queryString,
        state: 'valid',
      }
      countrySelectList(data)
        .then((res) => {
          this.countryList = res.data.map((item) => {
            let { cname, ename, countryCode } = item
            return {
              label: `${cname}(${ename})`,
              value: countryCode,
            }
          })
        })
        .catch(() => {})
    },
    cancel() {
      this.$parent.addOption.show = false
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
            type: 'normal',
            ...this.form
          }
          priceRuleSave(data)
            .then((res) => {
              if (res.code === 0) {
                this.$parent.getData()
                this.cancel()
                let text = option.type === 'add' ? '新增加价规则成功!' : '编辑加价规则成功!'
                this.$msgSucClose(text)
              }
            })
            .catch(() => {})
            .finally(()=> {
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
.add-form {
  .title {
    font-size: 12px;
    font-weight: bolder;
    color: #222;
    line-height: 20px;
    margin: 8px 0 16px 0;
    .tips{
      font-weight: normal;
      color:#bbb;
      margin-left: 5px;
    }
  }
  /deep/.el-form-item {
    margin-right: 0;
    display: flex;
    align-items: center;
    .el-form-item__content {
      flex: 1;
      .el-select {
        width: 100%;
      }
    }
  }
  .base-box {
    display: flex;
    .el-form-item {
      width: 25%;
    }
  }
  .price-box {
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
}
</style>
