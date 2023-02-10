<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div class="header-btn-class">
      <el-button type="primary" size="mini" @click="add()">Add</el-button>
    </div>
    <el-table
      :data="cargosList"
      border
      style="width: 100%">
      <el-table-column
        prop="hsCode"
        label="HS Code"
        >
        <template slot="header">
          <span>
            <span class="red">*</span> 
            <span class="label-title-class">HS Code</span>
          </span>
        </template>
        <template slot-scope="scope">
          <div class="middle-item">
            <el-select
              :loading="loading"
              :remote-method="getHscodeList"
              class="large-select"
              clearable
              filterable
              placeholder="Search Code..."
              remote
              reserve-keyword
              size="mini"
              v-model="scope.row.hsCode"
              allow-create
            >
              <el-option
                :key="i"
                :label="x.label"
                :value="x.value"
                v-for="(x, i) in hscodeList"
              ></el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="Description"
      >
        <template slot="header">
          <span>
              <span class="red">*</span> 
              <span class="label-title-class">Description</span>
          </span>
        </template>
        <template slot-scope="scope">
          <div class="middle-item">
            <el-input
               size="mini"
                placeholder="Enter Description..."
                v-model="scope.row.description"
            ></el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="marks"
        label="Marks"
      >
        <template slot="header">
          <span>
              <span class="red">*</span> 
              <span class="label-title-class">Marks</span>
          </span>
        </template>
        <template slot-scope="scope">
          <div class="middle-item">
            <el-input
               size="mini"
                placeholder="Enter Marks..."
                v-model="scope.row.marks"
            ></el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="quantity"
        label="Package Count/Type"
        >
        <template slot="header">
          <span>
              <span class="red">*</span> 
              <span class="label-title-class">Package Count/Type</span>
          </span>
        </template>
        <template slot-scope="scope">
          <div class="middle-item">
            <el-input-number
              class="small-input2"
              placeholder="Enter Count..."
              size="mini"
              v-model="scope.row.quantity"
              :min="1"
              :precision="0"
              :controls="false"
            ></el-input-number>
            <el-select
              :loading="loading"
              :remote-method="getPackageList"
              class="small-select2"
              filterable
              clearable
              placeholder="Enter Type..."
              remote
              reserve-keyword
              size="mini"
              v-model="scope.row.packageType"
              value-key="packageCode"
            >
              <el-option
                :key="cp.packageCode"
                :label="cp.descpt"
                :value="cp"
                v-for="cp in packageList"
              ></el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="weight"
        label="Cargo Gross Weight"
        >
        <template slot="header">
          <span>
              <span class="red">*</span> 
              <span class="label-title-class">Cargo Gross Weight</span>
          </span>
        </template>
        <template slot-scope="scope">
          <div class="middle-item">
            <el-input-number
              class="small-input"
              placeholder="Enter Weight..."
              size="mini"
              v-model="scope.row.weight"
                  :min="0.001"
              :precision="3"
              :controls="false"
            ></el-input-number>
            <el-select
              class="small-select"
              placeholder
              clearable
              size="mini"
              v-model="weightType"
              disabled
            >
              <el-option
                :key="cp.value"
                :label="cp.label"
                :value="cp.value"
                v-for="cp in weightTypeList"
              ></el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="volume"
        label="Cargo Gross Volume"
        >
        <template slot="header">
          <span>
              <span class="red">*</span> 
              <span class="label-title-class">Cargo Gross Volume</span>
          </span>
        </template>
        <template slot-scope="scope">
          <div class="middle-item">
            <el-input-number
              class="small-input"
              placeholder="Enter Volume..."
              size="mini"
              v-model="scope.row.volume"
                  :min="0.001"
              :precision="3"
              :controls="false"
            ></el-input-number>
            <el-select
              class="small-select"
              placeholder
              clearable
              size="mini"
              v-model="volumeType"
              disabled
            >
              <el-option
                :key="cp.value"
                :label="cp.label"
                :value="cp.value"
                v-for="cp in volumeTypeList"
              ></el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="100px"
      >
        <template slot-scope="scope">
          <el-button class="red" type="text" size="mini" v-if="cargosList.length > 1" @click="removeItemOuter(scope.$index)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { cargoHscodeList } from '@/api/base'
import { getPackageList } from '@/api/order/robotSi'
export default {
  components: {
    BaseDialog,
  },
  props: {
    dialogCargosOptions: {
       type: Object,
       default: () => {
        return {}
       }
    },
    shipCarrierCode: {
      type: String,
      default: '',
    },
    carrierSource: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      dialogConfig: {
				title: '货物编辑',
				show: true,
				size: 'medium',
        width: '1300px'
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
      cargosList: [],
      hscodeList: [],
      packageList: [],
      validateParams: [
        'hsCode',
        'description',
        'marks',
        'quantity',
        'volume',
        'weight',
        'packageType',
      ]
    }
  },
  created() {
     this.cargosList = this.dialogCargosOptions.list
  },
  methods: {
    // 搜索编码
    getHscodeList(str = '') {
      if (!str) return
      const data = {
        keyword: str,
        // carrierSource: this.carrierSource,
      }
      this.loading = true
      cargoHscodeList(data)
        .then((res) => {
          if (res.code === 0) {
            if (res.data) {
              this.hscodeList = res.data.map((item) => {
                const { hscode, cargoDesc } = item
                return {
                  label: `${cargoDesc}`,
                  value: hscode,
                  hsCodeDesc: cargoDesc,
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
      // 获取包装类型
    getPackageList(str = '') {
      const data = {
        packageName: str,
        baseCarrierCode: this.shipCarrierCode,
      }
      this.loading = true
      getPackageList(data)
        .then((res) => {
          if (res.code === 0) {
            this.packageList = (res.data || [])
            .map(item => {
              item['descpt'] = item.packageName
              return item
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    removeItemOuter(index) {
      this.$confirmWarn('确定删除此数据吗？', () => this.cargosList.splice(index, 1))
    },
    add() {
      this.cargosList.push({
        hsCode: '',
        description: '',
        marks: '',
        quantity: undefined,
        volume: undefined,
        weight: undefined,
        packageType: '',
        packageTypeCode: '',
      })
    },
    close(action, value, type) {
			this.$emit('close', action, value, type)
		},
    validate() {
      let check = true
      let len = this.cargosList.length
      let obj = {}
      for (let i = 0; i < len; i++) {
        obj = this.cargosList[i]
        for (let key in obj) {
          if (!obj[key] && this.validateParams.includes(key)) {
            check = false
            this.$message.warning('请完善数据')
            break
          }
        }
      }
      return check
    },
		dialogCallback(action, done) {
			if (action === 'Confirm') {
        if (!this.validate()) return
				this.close('Confirm', this.cargosList)
			} else {
				this.close('Cancel')
			}
		}
  }
}
</script>

<style lang="scss" scoped>
.header-btn-class {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}
.middle-item {
  .small-input2 {
    width: 30%;
  }
  .small-input {
    width: 60%;
  }
  .small-input3 {
    width: 100%;
  }
  .small-input4 {
    width: 30%;
  }
  .small-select {
    width: 40%;
  }
  .small-select2 {
    width: 70%;
  }
  .small-select4 {
    width: 40%;
  }
} 
</style>