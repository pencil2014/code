<template>
  <div class="cargo-table">
    <el-form label-width="auto" :model="cargosTabelData" :ref="refName" :show-message="false">
      <el-table header-row-class-name="goods-table-header" fit style="width: 100%" :data="cargosTabelData.list">
        <el-table-column prop="hscode" label="中文名称" align="center" width="250">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span style="display:inline-block;margin-right:3px">HS Code</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.hscode'" :rules="cargosTabelData.rules.hscode">
              <el-select size="mini" v-model="scope.row.hscode" clearable style="width: 100%" remote filterable placeholder="请选择HS Code" @change="handleChangeHscode(scope.row.hscode,scope.$index)" :remote-method="(val) => queryCargoHscode(val,scope.$index)">
                <el-option v-for="(item, index) in scope.row.hscodeOptions || []" :key="index" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="cname" label="中文名称" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span style="display:inline-block;margin-right:3px">中文名称</span>
            <!-- <el-tooltip class="item" effect="dark" content="请输入中文、数字和空格" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip> -->
          </template>
          <template slot-scope="scope">
            <!-- @input="checkCname(scope.row.cname)" @input="checkEname(scope.row.ename,'英文品名')" -->
            <el-form-item :prop="'list.'+scope.$index+'.cname'" :rules="cargosTabelData.rules.cname">
              <el-input size="mini" v-model="scope.row.cname" maxlength='1024' clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="ename" label="英文名称" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>英文名称</span>
            <!-- <el-tooltip class="item" effect="dark" content="请输入英文、数字、空格和英文符号" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip> -->
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.ename'" :rules="cargosTabelData.rules.ename">
              <el-input size="mini" v-model="scope.row.ename" @input="checkEname(scope.row.ename,'英文品名')" maxlength='1024' clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="件数" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>件数</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.quantity'" :rules="cargosTabelData.rules.quantity">
              <el-input size="mini" v-model="scope.row.quantity" @input="checkIntegerQuantity('quantity', scope.row)" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="毛重(KGS)" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>毛重(KGS)</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.weight'" :rules="cargosTabelData.rules.weight">
              <el-input size="mini" v-model="scope.row.weight" @input="checkNumInputMaxVal('weight', scope.row,'毛重')" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="体积(CBM)" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>体积(CBM)</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.volume'" :rules="cargosTabelData.rules.volume">
              <el-input size="mini" v-model="scope.row.volume" @input="checkNumInputMaxVal('volume', scope.row,'体积')" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="packageInfo" label="包装" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>包装</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.packageInfo'" :rules="cargosTabelData.rules.packageInfo">
              <el-select size="mini" v-model="scope.row.packageInfo" filterable clearable placeholder="请选择">
                <el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value" clearable> </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="length" label="长(M)" align="center">
          <template slot="header">
            <span style="display:inline-block;margin-right:3px">长(M)</span>
            <!-- <el-tooltip class="item" effect="dark" content="请输入大于0，小于等于999999的数字，小数点最多两位" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip> -->
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.length'" :rules="cargosTabelData.rules.length">
              <el-input size="mini" v-model="scope.row.length" clearable @input="checkNumInput('length', scope.row)" placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="width" label="宽(M)" align="center">
          <template slot="header">
            <span style="display:inline-block;margin-right:3px">宽(M)</span>
            <!-- <el-tooltip class="item" effect="dark" content="请输入大于0，小于等于999999的数字，小数点最多两位" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip> -->
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.width'" :rules="cargosTabelData.rules.width">
              <el-input size="mini" v-model="scope.row.width" @input="checkNumInput('width', scope.row)" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="height" label="高(M)" align="center">
          <template slot="header">
            <span style="display:inline-block;margin-right:3px">高(M)</span>
            <!-- <el-tooltip class="item" effect="dark" content="请输入大于0，小于等于999999的数字，小数点最多两位" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip> -->
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.height'" :rules="cargosTabelData.rules.height">
              <el-input size="mini" v-model="scope.row.height" @input="checkNumInput('height', scope.row)" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleDelete(scope.$index)" type="text" class="red" :disabled="isDisabled" size="mini">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <!-- <el-button @click="validateForm">校验</el-button> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { cargoHscodeList } from '@/api/base'
import { unique } from '@/utils/index'
var timer = ''
export default {
  data() {
    return {
      refName: 'form' + Math.random()
    }
  },
  props: {
    cargosTabelData: {
      type: Object,
      default() {
        return {}
      }
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    tabelType: {
      type: String,
      default: ''
    }
  },
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {},
  components: {},
  methods: {
    handleChangeHscode(val, index) {
      if (!val) {
        this.$set(this.cargosTabelData.list[index], 'hscodeOptions', [])
      }
    },
    // hscode模糊查询
    queryCargoHscode(queryString, index) {
      if (queryString) {
        cargoHscodeList({ keyword: queryString }).then((response) => {
          let hscodeOptions = response.data.map((item) => {
            return Object.assign(item, {
              label: item.cargoDesc,
              value: item.hscode
            })
          })
          hscodeOptions = unique(hscodeOptions, 'label')
          this.$set(
            this.cargosTabelData.list[index],
            'hscodeOptions',
            hscodeOptions || []
          )
        })
      } else {
        this.$set(this.cargosTabelData.list[index], 'hscodeOptions', [])
      }
    },
    handleDelete(index) {
      this.$emit('handleDelete', index)
    },
    validateForm() {
      // 表单验证
      return new Promise((resolve, reject) => {
        this.$refs[this.refName].validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    checkNumInput(prop, row) {
      let value = row[prop]
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = row[prop].substr(row[prop].length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
            row[prop] = ''
          } else if (value > 999999) {
            this.$message({
              message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
            row[prop] = 999999
          } else if (lastStr !== '.') {
            this.$message({
              message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
            row[prop] = Number(value).fixed(2)
          }
        }
        
        if (row.length && row.width && row.height && row.quantity) {
          console.log(1111)
          row.volume = Number(
            row.length * row.width * row.height * row.quantity
          ).fixed(3)
          this.$emit('cargoTableChange', this.tabelType, true)
        }
        if (row.length * row.width * row.height * row.quantity > 999999) {
          this.$message({
            message: `体积不能大于999999`,
            type: 'error'
          })
        }
      }, 800)
    },
    checkIntegerQuantity(prop, row) {
      let value = row.quantity
      clearTimeout(timer)
      let reg = /^([1-9][0-9]*)$/
      timer = setTimeout(() => {
        if (value) {
          if (!reg.test(value)) {
            row[prop] = ''
            this.$emit('cargoTableChange', this.tabelType, false)
            this.$message({
              message: `件数请输入大于0的整数`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            row[prop] = 999999
            this.$emit('cargoTableChange', this.tabelType, false)
            this.$message({
              message: `件数不能超过999999`,
              type: 'error',
              duration: 2000
            })
          }

          if (row.length && row.width && row.height && row.quantity) {
            row.volume = Number(
              row.length * row.width * row.height * row.quantity
            ).fixed(3)
            this.$emit('cargoTableChange', this.tabelType, true)
          }
          if (row.length * row.width * row.height * row.quantity > 999999) {
            this.$message({
              message: `体积不能大于999999`,
              type: 'error'
            })
          }
        }
      }, 800)
      if (!value) {
        // 触发货物数据自动计算
        this.$emit('cargoTableChange', this.tabelType, false)
      }
      if (reg.test(value)) {
        this.$emit('cargoTableChange', this.tabelType, false)
      }
    },
    checkNumInputMaxVal(prop, row, type) {
      let value = row[prop]
      clearTimeout(timer)
      let reg = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
      timer = setTimeout(() => {
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = row[prop].substr(row[prop].length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            this.$emit('cargoTableChange', this.tabelType, true)
            row[prop] = ''
          } else if (value > 999999) {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            row[prop] = 999999
            this.$emit('cargoTableChange', this.tabelType, true)
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            row[prop] = Number(value).fixed(3)
            this.$emit('cargoTableChange', this.tabelType, true)
          }
        }
      }, 800)
      if (!value) {
        this.$emit('cargoTableChange', this.tabelType, true)
      }
      if (reg.test(value)) {
        this.$emit('cargoTableChange', this.tabelType, true)
      }
    },
    checkCname(value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^[\u4e00-\u9fa50-9]+$/
          if (value) {
            let result = value.replace(/\s+/g, '')
            if (!reg.test(result)) {
              this.$message({
                message: `中文品名请输入中文、空格和数字`,
                type: 'error',
                duration: 2000
              })
            }
          }
        }
      }, 800)
    },
    checkEname(value, type) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^[a-z_A-Z0-9-\.!@#\$%\\\^&\*\)\(\+=\{\}\[\]\/",'<>~\·`\?:;|]+$/
        if (value) {
          let result = value.replace(/\s+/g, '')
          if (!reg.test(result)) {
            this.$message({
              message: `${type}请输入英文、数字、空格和英文符号`,
              type: 'error',
              duration: 2000
            })
          }
        }
      }, 800)
    }
  }
}
</script>

<style lang="scss" scoped>
.cargo-table {
  /deep/.el-form-item {
    margin-bottom: 0;
  }
  .red {
    color: #e63923;
  }
}
</style>
