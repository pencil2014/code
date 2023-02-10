<template>
  <div class="container-cnt">
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
              :label="`${index + 1}. Container Quantity/Type`"
              :required="true"
              prop="containerNum"
            >
              <el-input
                class="small-input"
                placeholder="Enter Number..."
                size="mini"
                v-model="item.containerNum"
              ></el-input>
              <!-- :remote-method="getContainerTypeList" remote-->
              <el-select
                @change="changeContainerType(item)"
                class="small-select"
                filterable
                placeholder="Select One"
                reserve-keyword
                size="mini"
                v-model="item.containerType"
              >
                <el-option
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  v-for="item in containerTypeList"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Single container weight" prop="weight">
              <el-input v-model="item.weight" placeholder="Enter Number...">
                <template slot="append">KG</template>
              </el-input>
            </el-form-item>
            <!-- <el-form-item
              label="One Bill One Container"
              prop="containerSeperate"
            >
              <el-select
                v-model="item.containerSeperate"
                placeholder="Select One"
                :disabled="index > 0"
                @change="changeSeperate"
              >
                <el-option
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  v-for="item in seperateType"
                ></el-option>
              </el-select>
            </el-form-item> -->
            <!-- <el-form-item label="Container Comments" prop="description">
              <el-input
                class="smaller-text"
                placeholder="Enter Comments..."
                size="mini"
                type="textarea"
                v-model="item.description"
              ></el-input>
            </el-form-item>-->
            <!-- <el-form-item :prop="name" label=" ">
              <el-checkbox size="mini" v-model="checked">已提供发货人</el-checkbox>
            </el-form-item>-->
          </div>
          <div class="btn-box">
            <i
              @click="addItem"
              class="el-icon-circle-plus"
              v-if="index === 0 && item.containerSeperate === 'no'"
            ></i>
            <i
              @click="removeItem(index)"
              class="el-icon-remove"
              v-if="index > 0"
            ></i>
          </div>
        </div>
        <div class="add-btn" v-show="item.showReefer">
          <el-button
            @click="showDialog(index, item)"
            icon="el-icon-plus"
            size="mini"
            type="primary"
          >
            Add Reefer Settings
          </el-button>
        </div>
      </el-form>
    </div>
    <ContainerDialog
      :dialogOptions="dialogOptions"
      @cancle="closeDialog"
      @submit="submitDialog"
      v-if="dialogOptions.show"
    />
  </div>
</template>

<script>
import ContainerDialog from './containerDialog'
import { containerTypeList } from '@/api/order/createBooking'
export default {
  inject: ['carrierSource'],
  props: {
    containerOption: {
      required: true,
      type: Array,
      default: () => [],
    },
  },
  components: {
    ContainerDialog,
  },
  data() {
    return {
      form: [
        {
          containerType: '',
          containerNum: '',
          containerSeperate: 'no',
          weight: '',
          // description: '',
          reeferDto: {
            humidity: '',
            airFlow: '',
            temperature: '',
            description: '',
          },
        },
      ],
      rules: {
        containerNum: {
          required: true,
          message: 'Container Quantity/Type is required',
          trigger: 'change',
        },
        weight: {
          required: true,
          message: 'Single container weight is required',
          trigger: 'change',
        },
      },
      seperateType: [
        {
          label: 'No',
          value: 'no',
        },
        {
          label: 'Yes',
          value: 'yes',
        },
      ],
      containerTypeList: [],
      dialogOptions: {
        show: false,
        index: 0,
        form: {},
      },
    }
  },
  created() {
    this.form = this.containerOption
  },
  watch: {
    containerOption() {
      this.form = this.containerOption
      let shipmentId = this.$route.query.shipmentId
      if (!shipmentId) {
        this.initData()
      }
    },
  },
  methods: {
    // 改变分单状态
    changeSeperate(val) {
      if (val === 'yes') {
        this.form = this.form.slice(0, 1)
      }
    },
    // 获取箱型
    getContainerTypeList(str = '') {
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
      }
      containerTypeList(data)
        .then((res) => {
          if (res.code === 0) {
            this.containerTypeList = res.data.map((item) => {
              const { containerTypeCode, uiDescription } = item
              return {
                label: uiDescription,
                value: containerTypeCode,
              }
            })
          }
        })
        .catch(() => {})
    },
    // 显示添加冷藏按钮
    changeContainerType(item) {
      const type = item.containerType
      if (!type) {
        item.showReefer = false
      } else {
        item.showReefer = type.includes('R')
      }
    },
    // 添加数据
    addItem() {
      this.form = this.form.concat({
        containerType: '',
        containerNum: '',
        containerSeperate: 'no',
        // description: '',
        reeferDto: {
          humidity: '',
          airFlow: '',
          temperature: '',
          description: '',
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
    // 校验数据
    validateForm() {
      let flag = true
      const len = this.form.length
      for (let index = 0; index < len; index++) {
        const source = this.form[index]
        const { containerType, containerNum, weight } = source
        if (!containerType || !containerNum || !weight) {
          flag = false
        }
      }
      return flag
    },
    // 初始化数据
    initData() {
      this.form.forEach((item, index) => {
        if (!item.containerType) {
          return
        }
        const data = {
          keyword: item.containerType,
          carrierSource: this.carrierSource,
        }
        containerTypeList(data, index)
          .then((res) => {
            if (res.code === 0 && res.data.length) {
              const source = res.data.find(
                (option) => option.baseContainerType === item.containerType
              )
              if (source) {
                item.containerType = source.containerTypeCode
              } else {
                item.containerType = ''
              }
            } else {
              item.containerType = ''
            }
            if (this.$refs[`form${index}`].length) {
              this.$nextTick(() => {
                this.$refs[`form${index}`][0].clearValidate()
              })
            }
          })
          .catch(() => {})
      })
    },
  },
  mounted() {
    this.getContainerTypeList()
  },
}
</script>

<style lang="scss" scoped>
.container-cnt {
  .form {
    padding: 8px 0 0 8px;
    .el-form-item {
      width: 30%;
      margin-bottom: 15px;
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
    .form-cnt {
      display: flex;
      justify-content: space-between;
      flex: 1;
      .el-form-item {
        width: 45%;
      }
    }
    .btn-box {
      flex-basis: 40px;
      display: flex;
      align-items: center;
      justify-content: space-around;
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
    margin-top: 5px;
    .el-button--mini {
      height: 22px;
      line-height: 22px;
      padding: 0 10px;
      font-size: 12px;
      background-color: #277ab5;
      border: none;
      &:hover {
        background-color: #216697;
      }
    }
  }
  .small-input {
    width: 30%;
  }
  .small-select {
    width: 70%;
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
}
</style>
