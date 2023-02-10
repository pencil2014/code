<template>
  <el-dialog :appendToBody="true" :visible.sync="options.show" :title="options.disabled ? '查看航线':'添加航线'" width="800px">
    <div class="table-data" v-if="options.disabled">
      <FinanceTableMass :option="option1" />
    </div>
    <div class="addline-cnt" v-else>
      <div class="addline-box">
        <div class="title">
          <span>业务类型</span>
          <span>航线</span>
        </div>
        <div class="list-box">
          <div :key="index" class="item" v-for="(item,index) in settleLineList">
            <div class="business-type">
              <el-select
                @change="changeBusinessType(index)"
                placeholder="请选择"
                size="mini"
                multiple
                collapse-tags
                v-model="item.businessType"
              >
                <el-option
                  :key="i"
                  :label="item.label"
                  :value="item.value"
                  v-for="(item,i) in options.businessType"
                  :disabled="options.disabled || item.disabled"
                ></el-option>
              </el-select>
            </div>
            <div class="line-list">
              <el-select
                collapse-tags
                filterable
                multiple
                placeholder="请选择"
                size="mini"
                @change="changeLine(item)"
                v-model="item.sysLineCode"
              >
                <el-option
                  :key="x"
                  :label="item.label"
                  :value="item.value"
                  :disabled="options.disabled || item.disabled"
                  v-for="(item,x) in item.sysLine"
                ></el-option>
              </el-select>
            </div>
            <div class="btn-box" v-show="!options.disabled">
              <i
                @click="addLine"
                class="el-icon-circle-plus-outline"
                v-if="index === 0 && options.businessType.length > settleLineList.length"
              ></i>
              <i
                @click="delLine(index)"
                class="el-icon-remove-outline"
                v-if="index > 0 && options.businessType.length !== 1"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="dialog-footer" slot="footer">
      <template v-if="options.disabled">
        <el-button @click="cancel" size="mini" type="primary">关闭</el-button>
      </template>
      <template v-else>
        <el-button @click="cancel" size="mini">取消</el-button>
        <el-button @click="submit" size="mini" type="primary">提交</el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { dictListByBusiness } from '@/api/crm/contract'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  components: {
    FinanceTableMass
  },
  mixins: [mixin],
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      settleLineList: [
        // {
        //   businessType: [],
        //   sysLineCode: [],
        //   sysLine: [],
        //   business: ''
        // }
      ],
      option1: {}
    }
  },
  created () {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      maxHeight: 300,
      operationBtns: false,
      noClickCheck: true,
      columns: [
        {
          prop: 'businessType',
          label: '业务类型',
          type: 'text',
          width: '200px',
          formatter: ({row}) => {
            let { businessType }  = row
            let text = businessType.map(item => {
              let data = this.options.businessType.filter(ele => ele.value === item)
              return data?.length ? data[0].label : ''
            }).join('，')
            return text
          }
        },
        {
          prop: 'sysLineCode',
          label: '航线',
          type: 'text',
          formatter: ({row}) => {
            let { sysLineCode, sysLine } = row
            let text = sysLineCode.map(item => {
              let data = sysLine.filter(ele => ele.value === item)
              return data?.length ? data[0].label : ''
            }).join('，')
            if (text === '所有航线') {
              text = sysLine.map(ele => ele.label).join('，').replace('所有航线，','')
            }
            return text
          }
        }
      ]
    })
  },
  methods: {
    // 提交
    submit() {
      const businessTypes = this.settleLineList.map(item => item.businessType).flat(Infinity)
      const setTypes = Array.from(new Set(businessTypes))
      if (businessTypes.length === 0) {
        this.$emit('cancel')
      }
      if (businessTypes.length !== setTypes.length) {
        return this.$msgErrClose('业务类型存在重复')
      }
      const status = this.settleLineList.some(item => {
        return !(item.businessType && item.sysLineCode.length)
      })
      if (status) {
        return this.$msgErrClose('业务类型、航线必须填写完整')
      }
      const data = this.settleLineList.map(item => {
        const { businessType, sysLineCode, sysLine, business } = item
        return {
          businessType,
          sysLineCode,
          sysLine,
          business
        }
      })
      this.$emit('submit', data)
    },
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    // 改变业务类型
    changeBusinessType(index) {
      const dataSource = this.settleLineList[index]
      const { businessType } = dataSource
      let businessList = this.options.businessType.filter(item => businessType.includes(item.value)).map(ele => ele.business)
      let businessSet = Array.from(new Set(businessList))
      if (businessSet.length > 1 ) {
        dataSource.businessType.pop()
        return this.$msgErrClose('只能组合同类型的业务')
      }
      if (!businessType.length) {
        dataSource.sysLineCode = ''
      }
      dataSource.business = businessSet[0]
      if (businessType.length > 1) {
        return
      }
      const data = {
        businessType:businessType[0],
        systemLineName: ''
      }
      dictListByBusiness(data)
        .then(res => {
          this.settleLineList[index].sysLine = res.data.map(item => {
            return {
              label: item.cname,
              value: item.sysLineCode,
              ename: item.ename,
              businessType: item.businessType,
              disabled: false
            }
          })
          this.settleLineList[index].sysLine.unshift({
          businessType: businessType,
          label: '所有航线',
          value: '100000001',
          ename: 'all',
          disabled: false
        })
        })
        .catch(() => {})
    },
    // 添加
    addLine() {
      this.settleLineList.push({
        businessType: [],
        sysLineCode: [],
        sysLine: []
      })
    },
    // 删除
    delLine(index) {
      this.settleLineList.splice(index, 1)
    },
    // 改变航线
    changeLine (item) {
      if (item.sysLineCode.includes('100000001')) {
          item.sysLineCode = ['100000001']
          item.sysLine.forEach(ele => {
            if (ele.value === '100000001') {
              ele.disabled = false
            } else {
              ele.disabled = true
            }
          })
        } else {
          item.sysLine.forEach(ele => (ele.disabled = false))
        }
    }
  },
  mounted() {
    if (this.options.settleLineList?.length) {
      let businessTypes = this.options.settleLineList.map(
        item => item.businessType
      )
      businessTypes = businessTypes.flat(Infinity)
      const setTypes = Array.from(new Set(businessTypes))
      if (setTypes.length) {
        this.settleLineList = []
        setTypes.forEach(item => {
          const source = this.options.settleLineList.filter(
            ele => {
              if (Array.isArray(ele.businessType)) {
                return ele.businessType.includes(item)
              } else {
                return ele.businessType === item
              }
            }
          )
          const sysLine = source[0].sysLine ? source[0].sysLine : []
          let business = source[0].business ? source[0].business : ''
          if (!business) {
            business = item.split('_')[0]
          }
          let sysLineCode = source.map(v => v.sysLineCode).flat(Infinity)
          let hasBusiness = this.settleLineList.find(v => v.business === business)
          if (hasBusiness) {
            let sameLine = hasBusiness.sysLineCode.sort().toString() === sysLineCode.sort().toString()
            if (sameLine) {
              hasBusiness.businessType.push(item)
            } else {
              this.settleLineList.push({
                businessType: [item],
                sysLineCode,
                sysLine,
                business
              })
            }
          } else {
            this.settleLineList.push({
              businessType: [item],
              sysLineCode,
              sysLine,
              business
            })
          }

        })
      }
      this.settleLineList.forEach(async item => {
        const businessType = item.businessType
        if (!item.sysLine.length) {
          await dictListByBusiness({ businessType:businessType[0] })
            .then(res => {
              item.sysLine = res.data.map(item => {
                return {
                  label: item.cname,
                  value: item.sysLineCode,
                  ename: item.ename,
                  businessType,
                  disabled: false
                }
              })
              item.sysLine.unshift({
                businessType,
                label: '所有航线',
                value: '100000001',
                ename: 'all',
                disabled: false})
            })
            .catch(() => {})
        }
      })
      this.option1.data = this.settleLineList
      // let tableData = [].concat(this.settleLineList)
      // let hasTypes = this.settleLineList.map(item => item.businessType).flat(Infinity)
      // let noData = []
      // this.options.businessType.forEach(ele => {
      //   let businessType = ele.value
      //   if (!hasTypes.includes(businessType)) {
      //     let business = businessType.split('_')[0]
      //     let hasBusiness = noData.find(v => v.business === business)
      //    if (hasBusiness) {
      //      hasBusiness.businessType.push(businessType)
      //    } else {
      //      noData.push({
      //       businessType: [businessType],
      //       sysLineCode: ['100000001'],
      //       sysLine:[],
      //       business
      //     })
      //    }
      //   }
      // })
      // noData.forEach(async (v) => {
      //   let businessType = v.businessType[0]
      //   await dictListByBusiness({ businessType })
      //       .then(res => {
      //         v.sysLine = res.data.map(item => {
      //           return {
      //             label: item.cname,
      //             value: item.sysLineCode,
      //             ename: item.ename,
      //             businessType,
      //             disabled: false
      //           }
      //         })
      //         v.sysLine.unshift({
      //           businessType,
      //           label: '所有航线',
      //           value: '100000001',
      //           ename: 'all',
      //           disabled: false})
      //       })
      //       .catch(() => {})
      // })
      // this.option1.data = tableData.concat(noData)
    } else {
      this.options.businessType.forEach(item => {
        this.settleLineList.push({
          businessType: [item.value],
          sysLineCode: ['100000001'],
          sysLine: [],
          business: item.value.split('_')[0]
        })
      })
      this.settleLineList.forEach(async item => {
        const businessType = item.businessType
        if (!item.sysLine.length) {
          await dictListByBusiness({ businessType:businessType[0] })
            .then(res => {
              item.sysLine = res.data.map(item => {
                return {
                  label: item.cname,
                  value: item.sysLineCode,
                  ename: item.ename,
                  businessType,
                  disabled: true
                }
              })
              item.sysLine.unshift({
                businessType,
                label: '所有航线',
                value: '100000001',
                ename: 'all',
                disabled: false})
            })
            .catch(() => {})
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.addline-box {
  .title {
    background-color: #f8f9fd;
    height: 30px;
    line-height: 30px;
    display: flex;
    align-items: center;
    font-weight: bolder;
    color: #909399;
    font-size: 12px;
    span {
      flex: 1;
      text-align: center;
      border-bottom: 1px solid #dcdfe6;
    }
  }
  .list-box {
    max-height: 350px;
    overflow: auto;
    .item {
      display: flex;
      margin: 8px 0;
      .business-type {
        margin-right: 5px;
      }
      .business-type,
      .line-list {
        flex: 1;
        align-items: center;
      }
      .btn-box {
        width: 40px;
        text-align: center;
        i {
          font-size: 20px;
          color: #aaa;
          cursor: pointer;
          &:hover {
            color: #1890ff;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.list-box {
  .el-select,
  .el-select--mini,
  .el-input__inner,
  .el-select__input.is-mini {
    width: 100%;
    height: 20px !important;
    line-height: 20px;
  }
  .el-select .el-select__tags span {
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
