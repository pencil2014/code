<template>
  <div class="goods-cnt">
    <div
      :class="{ border: index !== 0 }"
      :key="index"
      class="form-item"
      v-for="(item, index) in form"
    >
      <el-form
        :inline="true"
        :model="item"
        :ref="`form${index}`"
        :rules="rules"
        class="form"
        label-position="top"
        size="mini"
      >
        <div class="item-info">
          <div class="form-cnt">
            <el-form-item
              :label="`${index + 1}. Cargo Name`"
              prop="cargoName"
              class="large-item"
            >
              <el-input
                placeholder="Enter Cargo Name..."
                size="mini"
                type="textarea"
                v-model="item.cargoName"
                autosize
              ></el-input>
            </el-form-item>
            <el-form-item label="HS Code" prop="hsCode" class="small-item">
              <el-select
                :loading="loading"
                :remote-method="getHscodeList"
                @change="changeHscode(index)"
                class="large-select"
                filterable
                placeholder="Search Code..."
                remote
                reserve-keyword
                size="mini"
                v-model="item.hsCode"
                allow-create
              >
                <el-option
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  v-for="option in hscodeList"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Outer Package Count/Type"
              prop="quantity"
            >
              <el-input
                class="smaller2-input"
                placeholder="Enter Count..."
                size="mini"
                v-model="item.quantity"
              ></el-input>
              <el-select
                :loading="loading"
                :remote-method="getPackageList"
                class="smaller2-select"
                filterable
                placeholder="Enter Type..."
                remote
                reserve-keyword
                size="mini"
                v-model="item.packageType"
                value-key="packageCode"
              >
                <el-option
                  :key="item.packageCode"
                  :label="item.descpt"
                  :value="item"
                  v-for="item in packageList"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="CargoType" prop="cargoType">
              <el-select v-model="item.cargoType" placeholder="Select Type...">
                <el-option label="GC普通货" value="GC"></el-option>
                <el-option label="RF冷冻柜" value="RF"></el-option>
                <el-option label="DG危险品" value="DG"></el-option>
              </el-select>
            </el-form-item> -->
            <el-form-item
              label="Cargo Weight (Excludes Tare)"
              prop="weight"
              class="small-item2"
            >
              <el-input-number
                class="smaller-input"
                placeholder="Enter Weight..."
                size="mini"
                v-model="item.weight"
                :precision="3"
                :controls="false"
              ></el-input-number>
              <el-select
                class="smaller-select"
                placeholder
                size="mini"
                v-model="weightType"
                disabled
              >
                <el-option
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  v-for="option in weightTypeList"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="Gross Volume"
              prop="volume"
              class="small-item2"
            >
              <el-input-number
                class="smaller-input"
                placeholder="Enter Volume..."
                size="mini"
                v-model="item.volume"
                :precision="3"
                :controls="false"
              ></el-input-number>
              <el-select
                class="smaller-select"
                placeholder
                size="mini"
                v-model="volumeType"
                disabled
              >
                <el-option
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  v-for="option in volumeTypeList"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="btn-box">
            <i
              @click="addItem"
              class="el-icon-circle-plus"
              v-if="index === 0"
            ></i>
            <i @click="removeItem(index)" class="el-icon-remove" v-else></i>
          </div>
        </div>
        <!-- <div class="add-btn">
          <el-button
            @click="showDialog(index)"
            icon="el-icon-plus"
            size="mini"
            type="primary"
          >
            Add Hazmat Details
          </el-button>
        </div> -->
      </el-form>
    </div>
    <GoodsDialog
      :dialogOptions="dialogOptions"
      @cancle="closeDialog"
      @submit="submitDialog"
      v-if="dialogOptions.show"
    />
  </div>
</template>

<script>
import GoodsDialog from './goodsDialog'
import { hscodeList, packageList } from '@/api/order/createBooking'
export default {
  inject: ['carrierSource'],
  props: {
    goodsOption: {
      required: true,
      type: Array,
      default: () => [],
    },
  },
  components: {
    GoodsDialog,
  },
  data() {
    return {
      form: [
        {
          cargoName: '',
          description: '',
          hsCode: '',
          packageTypeCode: '',
          packageType: '',
          weight: '',
          volume: '',
          marks: '',
          quantity: '',
          dangerousDto: {
            hazardCode: '',
            undgNo: '',
            flashPoint: '',
            dangerLevel: '',
            contact: {
              email: '',
              name: '',
              telPhone: '',
            },
          },
        },
      ],
      rules: {
        cargoName: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        hsCode: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        quantity: {
          required: true,
          message: 'Outer Package Count/Type is required',
          trigger: 'change',
        },
        weight: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        volume: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      options: [],
      dialogOptions: {
        index: '',
        show: false,
        form: {},
      },
      weightType: 'KG',
      weightTypeList: [
        {
          label: 'KG',
          value: 'KG',
        },
        {
          label: 'LBS',
          value: 'LBS',
        },
      ],
      volumeType: 'CBM',
      volumeTypeList: [
        {
          label: 'CBM',
          value: 'CBM',
        },
        {
          label: 'CFT',
          value: 'CFT',
        },
      ],
      loading: false,
      hscodeList: [],
      packageList: [],
      carrierScac: '',
    }
  },
  watch: {
    goodsOption() {
      this.form = this.goodsOption
    },
  },
  created() {
    this.form = this.goodsOption
  },
  methods: {
    // 搜索编码
    getHscodeList(str = '') {
      if (!this.carrierScac) {
        return
      }
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
        scac: this.carrierScac,
      }
      this.loading = true
      hscodeList(data)
        .then((res) => {
          if (res.code === 0) {
            if (res.data) {
              this.hscodeList = res.data.map((item) => {
                const { hsCode, hsCodeDesc } = item
                return {
                  label: `${hsCode} ${hsCodeDesc}`,
                  value: hsCode,
                  hsCodeDesc,
                }
              })
            } else {
              this.hscodeList = []
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    // 改变编码
    changeHscode(index) {
      const hsCode = this.form[index].hsCode
      const data = this.hscodeList.filter((item) => item.value === hsCode)[0]
      if (!this.form[index].cargoName) {
        this.form[index].cargoName = data.hsCodeDesc
      }
    },
    // 添加数据
    addItem() {
      this.form.push({
        cargoName: '',
        description: '',
        hsCode: '',
        packageTypeCode: '',
        packageType: '',
        quantity: '',
        weight: '',
        volume: '',
        marks: '',
        dangerousDto: {
          hazardCode: '',
          undgNo: '',
          flashPoint: '',
          dangerLevel: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
          },
        },
      })
    },
    // 删除数据
    removeItem(index) {
      this.$confirmWarn('确定删除此数据吗？', () => this.form.splice(index, 1))
    },
    // 显示弹窗
    showDialog(index) {
      this.dialogOptions.index = index
      this.dialogOptions.form = this.form[index]
      this.dialogOptions.show = true
    },
    // 提交弹窗
    submitDialog(data) {
      const { index } = this.dialogOptions
      this.form[index] = data
      this.closeDialog()
    },
    // 关闭弹窗
    closeDialog() {
      this.dialogOptions.show = false
    },
    // 获取包装类型
    getPackageList(str = '') {
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
      }
      this.loading = true
      packageList(data)
        .then((res) => {
          if (res.code === 0) {
            this.packageList = res.data || []
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    // 校验数据
    validateForm() {
      let flag = true
      const len = this.form.length
      for (let index = 0; index < len; index++) {
        const name = 'form' + index
        this.$refs[name][0].validate((valid) => {
          if (!valid) {
            flag = false
          }
        })
        const { packageType } = this.form[index]
        if (!packageType) {
          flag = false
        }
      }
      return flag
    },
  },
  mounted() {
    this.$EventBus.$on('carrierScac', (val) => {
      this.carrierScac = val
      this.getHscodeList()
    })
  },
}
</script>

<style lang="scss" scoped>
.goods-cnt {
  .form {
    padding: 8px 8px 0;
    .el-form-item {
      width: 20%;
    }
    .el-form-item__label,
    .el-form-item__content {
      line-height: 22px;
    }
  }
  .border {
    border-top: 1px solid rgba(0, 0, 0, 0.125);
  }
  .form-item {
    padding-bottom: 10px;
  }
  .item-info {
    display: flex;
    margin-bottom: 10px;
    .form-cnt {
      flex: 1;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .el-form-item {
        width: 45%;
      }
    }
    .btn-box {
      display: flex;
      align-items: center;
      margin-top: 20px;
      margin-left: 5px;
      i {
        font-size: 20px;
        cursor: pointer;
        &.el-icon-circle-plus {
          color: #417f90;
          &:hover {
            color: #356572;
          }
        }
        &.el-icon-remove {
          color: #ccc;
          &:hover {
            color: #999;
          }
        }
      }
    }
  }
  .add-btn {
    width: 100%;
    .el-button--mini {
      height: 22px;
      line-height: 22px;
      padding: 0 10px;
      font-size: 12px;
      margin-top: 5px;
      background-color: #277ab5;
      border: none;
      &:hover {
        background-color: #216697;
      }
    }
  }
  .smaller-input {
    width: 80%;
  }
  .smaller2-select {
    width: 60%;
  }
  .smaller-select {
    width: 20%;
  }
  .smaller2-input {
    width: 40%;
  }
  .smaller-text {
    height: 22px;
    line-height: 22px;
    .el-textarea__inner {
      height: 22px;
      padding: 0 5px;
      min-height: 22px;
      width: 100%;
    }
  }
  .large-select {
    width: 100%;
  }
}
</style>
