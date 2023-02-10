<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="addContForm" :model="addContItem" class="add-container-form">
      <div class="status-row">
        <div class="item" v-if="addInfo.bkgStatus">加柜状态：{{addInfo.bkgStatus | bkgStatusFilter}}</div>
        <div class="item" v-if="addInfo.bkgStatus === 'refuse' || addInfo.bkgStatus === 'book_refuse'">拒绝原因：{{refuseReasonFilter(addInfo.refuseReason)}}</div>
        <div class="item" v-if="addInfo.bkgStatus === 'refuse' || addInfo.bkgStatus === 'book_refuse'">拒绝备注：{{addInfo.refuseRemark}}</div>
      </div>
      <!-- 订单基本信息 -->
      <el-row class="order-info-row">
        <el-col :span="24" class="tit">基础信息</el-col>
        <el-col :span="8" class="item">起运港：{{polPortEname}}</el-col>
        <el-col :span="8" class="item">目的地：{{podPortEname}}</el-col>
        <el-col :span="8" class="item">大船船名航次：{{vesselVoyageStr}}</el-col>
        <el-col :span="24" class="item">so号：{{createItem.soStr}}</el-col>
      </el-row>
      <!-- <div class="total">
        <span class="cyTotal">箱型箱量总计：{{ allContTotal.container }}</span>
        <span class="quantityTotal">件数总计：{{ allContTotal.quantity }}</span>
        <span class="weightTotal">重量总计：{{ allContTotal.weight }}KGS</span>
        <span class="volumeTotal">体积总计：{{ allContTotal.volume }}CBM</span>
      </div> -->
      <!-- 原箱型箱量 -->
      <OrignalContainer :containerTotal="origContainerTotal" :addInfo="addInfo" ref="origSoContainer"/>
      <!-- 新箱型箱量 -->
      <NewContainer :containerTotal="newContainerTotal" :addContItem="addContItem" :bkgStatus="addInfo.bkgStatus" ref="newSoContainer" />
      <el-form-item label="备注：如是加柜，请在下方备注说明是在原SO上加柜，还是另外加订" prop="containerAddRemark">
        <el-input size="mini" :rows="4" type="textarea" placeholder="请输入" v-model="addContItem.containerAddRemark" maxlength="512" show-word-limit :disabled="!['', 'draft', 'refuse'].includes(addInfo.bkgStatus)"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { getDictLabel } from '@/utils/tools'
import { add, addDelete, addCancel, addInfo } from '@/api/order/book/container'
import OrignalContainer from './originalContainer2'
import NewContainer from './newContainer'

export default {
  filters: {
    bkgStatusFilter(bkgStatus) {
      return getDictLabel('bkgStatus', bkgStatus)
    },
  },
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '调整箱型箱量',
        show: true,
        size: 'medium',
        width: "90%",
        showBtns: false,
        btns: [
          {label: '取消', action: 'Cancel', type: 'default'},
          // {label: '保存', action: 'Confirm', type: 'primary'},
          // // {label: '提交', action: 'Submit', type: 'primary'},
          // {label: '删除', action: 'Delete', type: 'danger'},
          // {label: '撤回', action: 'Recall', type: 'danger'}
        ]
      },
      addContItem: {
        soContainerList: [],
        containerAddRemark: ''
      },
      addInfo: {
        orgSoContainerList: []
      },
      isSubmit: false,
      polPortEname: '',
      podPortEname: '',
      vesselVoyageStr: ''
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.getInit()
    this.getAddInfo()
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),
    // 新增加柜和加柜状态为草稿,审核拒绝的可以编辑，submit等其他状态不可编辑
    disabledState() {
      let result = true
      if (!this.addInfo.bkgStatus || this.addInfo.bkgStatus === 'draft' || this.addInfo.bkgStatus === 'refuse') {
        result = false
      }
      return result
    },
    //原箱型箱量统计
		origContainerTotal() {
			return this.getContainerTotal(this.addInfo.orgSoContainerList)
    },
    //新箱型箱量统计
		newContainerTotal() {
			return this.getContainerTotal(this.addContItem.soContainerList)
		},
  },
  watch: {
  },
  components: {
    BaseDialog,
    OrignalContainer,
    NewContainer
  },
  methods: {
    getInit() {
      let { polPortName, podPortName, vessel, voyage} = this.createItem.ship
			let polPointIndex = polPortName.indexOf(',')
			let podPointIndex = podPortName.indexOf(',')
			if (polPointIndex !== -1) {
				this.polPortEname = polPortName.slice(0, polPointIndex)
			}
			if (podPointIndex !== -1) {
				this.podPortEname = podPortName.slice(0, podPointIndex)
      }
      if (vessel || voyage) {
        this.vesselVoyageStr = `${vessel}/${voyage}`
      }
    },
    // 箱型箱量统计方法：适用于多组箱型箱量(单SO)数组格式
		getContainerTotal(soContainerList) {
			let quantity = 0
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			let weightStr = ''
			// let { soContainerList } = this.containerInfo
			soContainerList.forEach(item => {
				item.containerList.forEach(o => {
					quantity += o.quantity && o.containerNum ? Number(o.quantity) * Number(o.containerNum) : 0
					weight += o.weight && o.containerNum ? Number(o.weight) * Number(o.containerNum) : 0
					volume += o.volume && o.containerNum ? Number(o.volume) * Number(o.containerNum) : 0
					weight = parseFloat(weight.toFixed(3))
					volume = parseFloat(volume.toFixed(3))
          quantity = parseFloat(quantity.toFixed(3))
					containerArr.push({
						containerType: o.containerType ? o.containerType : '',
						containerNum: o.containerNum ? o.containerNum : '',
						weight: o.weight ? o.weight : ''
					})
				})
			})
			// console.log('containerArr', containerArr)
			// 箱型箱量合计统计把相同的箱型元素的箱量相加合并
			let containerTypeArr = [...new Set(containerArr.map(item => item.containerType))]
			containerTypeArr.forEach(item => {
				let arr = containerArr.filter(keys => keys.containerType === item)
				let sum = arr.reduce((a, b) => Number(a) + Number(b.containerNum), 0)
				mergeArr.push({
					containerType: item,
					containerNum: sum
				})
			})
			mergeArr.forEach((item, index) => {
				const firstText = index > 0 ? '+' : ''
				if (item.containerType || item.containerNum) {
					container += firstText + `${item.containerType} * ${item.containerNum}`
				}
			})
			// 单柜重量
			containerArr.forEach((item, index) => {
				const weightFirstText = index > 0 ? '、' : ''
				if (item.containerType || item.weight) {
					weightStr += weightFirstText + `${item.containerType}: ${item.weight}KGS`
				}
			})
			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				container: container,
				weightStr: weightStr
			}
		},
    refuseReasonFilter(refuseReason) {
      let result = ''
      let {orderAuditRefuseReason, bkgRefuseReason} = this.dictMap
      let refuseReasonOptions = orderAuditRefuseReason.concat(bkgRefuseReason)
      let findItem = refuseReasonOptions.find(item => item.value === refuseReason)
      result = findItem ? findItem.label : ''
      return result
    },
    getAddInfo() {
      this.isSubmit = false
      addInfo({orderNo: this.$route.query.orderNo}).then(res => {
        let {data} = res
        this.addInfo = data || {}
        // 新箱型箱量数据的取值
        if (data.soContainerList && data.soContainerList.length) {
          this.$set(this.addContItem, 'soContainerList', data.soContainerList)
        } else if (data.orgSoContainerList && data.orgSoContainerList.length){
          this.$set(this.addContItem, 'soContainerList', data.orgSoContainerList)
        } else {
          this.$set(this.addContItem, 'soContainerList', JSON.parse(JSON.stringify(this.createItem.soContainerList)))
        }
        // 第一次加柜，原箱型箱量数据取订单详情的数据
        if (!data.orgSoContainerList || !data.orgSoContainerList.length) {
          this.addInfo.orgSoContainerList = this.createItem.soContainerList
        }
        this.addInfo.orgSoContainerList = this.addInfo.orgSoContainerList.map(item => {
          return {...item, containerListShowState: true}
        })
        this.$set(this.addContItem, 'containerAddRemark', data.containerAddRemark)
        // this.addContItem.containerAddRemark = data.containerAddRemark
        this.dialogConfig.showBtns = true
        this.dialogConfig.btns = [{label: '取消', action: 'Cancel'}]
        // 新增加柜的按钮
        if (!this.addInfo.bkgStatus) {
          this.dialogConfig.btns = [
            {label: '取消', action: 'Cancel'},
            // {label: '保存', action: 'Confirm', type: 'primary'},
            {label: '提交', action: 'Submit', type: 'primary'}
          ]
        }
        // 加柜状态是草稿或是审核拒绝的按钮
        if (this.addInfo.bkgStatus === 'draft' || this.addInfo.bkgStatus === 'refuse') {
          this.dialogConfig.btns = [
            {label: '取消', action: 'Cancel'},
            // {label: '保存', action: 'Confirm', type: 'primary'},
            {label: '提交', action: 'Submit', type: 'primary'},
            {label: '删除', action: 'Delete', type: 'danger'},
          ]
        }
        // 加柜状态是提交待审核的按钮
        if (this.addInfo.bkgStatus === 'submit') {
          this.dialogConfig.btns = [
            {label: '取消', action: 'Cancel'},
            {label: '撤回', action: 'Recall', type: 'danger'},
          ]
        }
      })
    },
    close(action) {
      this.$emit('close', action)
    },
    validate() {
      return true
    },
    // 校验新箱型箱量和原箱型箱量是否一样
    isSameContainer(oldVal, newVal) {
      // console.log('oldVal, newVal', oldVal, newVal)
      let oldArr = []
      oldVal.forEach(item => {
        item.containerList.forEach(ele => {
          oldArr.push(ele.containerType + '*' + ele.containerNum)
        })
      })
      let newArr = []
      newVal.forEach(item => {
        item.containerList.forEach(ele => {
          newArr.push(ele.containerType + '*' + ele.containerNum)
        })
      })
      console.log('oldVal, newVal', oldArr, newArr)
      return oldArr.length === newArr.length && oldArr.every((item, index) => item === newArr[index])
    },
    dialogCallback(action, done) {
      if (action === 'Confirm' || action === 'Submit') {
        let canSubmit = true
        let containerList = this.$refs['newSoContainer'].$refs['containerList']
        this.$refs.addContForm.validate(valid => {
          if (valid) {
            // 箱型箱量校验
            for (var i = 0; i < containerList.length; i++) {
              containerList[i].validate(isVaild => {
                if (isVaild) {
                } else {
                  canSubmit = false
                  console.log('error submit!!')
                  return
                }
              })
            }
            // this.handleAddSave(action)
          } else {
            canSubmit = false
            console.log('error submit!!')
					  return false
          }
        })
        if (canSubmit) {
          let submitState = true
          this.addContItem.soContainerList.map(item => {
            item.containerList.map(ele => {
              if (ele.temperatureMax && ele.temperatureMin && Number(ele.temperatureMax) <= Number(ele.temperatureMin)) {
                submitState = false
              }
            })
          })
          if (!submitState) {
            return this.$message.error('最高温度不能低于最低温度')
          }
          if (this.isSameContainer(this.addInfo.orgSoContainerList, this.addContItem.soContainerList)) {
            return this.$confirm(`新箱型箱量与原箱型箱量一样，是否确认发起申请?`, '警告', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.handleAddSave(action)
            }).catch(err => {
              console.log('err')
            })
          }
          this.handleAddSave(action)
        }
      } else if (action === 'Delete') {
        this.handleAddDelete()
      } else if (action === 'Recall') {
        this.handleAddCancel()
      } else {
        this.close('Cancel')
      }
    },
    // 加柜保存，提交
    handleAddSave(action) {
      if (this.isSubmit) return
      this.isSubmit = true
      add({
        orderNo: this.$route.query.orderNo,
        submitType: action === 'Confirm' ? 'draft' : 'submit',
        soContainerList: this.addContItem.soContainerList,
        containerAddRemark: this.addContItem.containerAddRemark
      }).then(res => {
        this.$message({
          type: 'success',
          message: action === 'Confirm' ? '保存成功' : '提交成功',
        })
        this.getAddInfo()
        // this.isSubmit = false
        // this.close('Confirm')
      }).catch((err) => {
        this.isSubmit = false
      });
    },
    // 加柜删除
    handleAddDelete() {
      this.$confirm(`是否删除该加柜?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
        addDelete({orderNo: this.$route.query.orderNo}).then(res => {
          this.$message({type: 'success', message: '删除成功'})
          this.getAddInfo()
          // this.close('Cancel')
        })
      }).catch(err => {
        console.log('err')
      })
    },
    // 加柜撤回
    handleAddCancel() {
      this.$confirm(`是否撤回该加柜?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
        addCancel({orderNo: this.$route.query.orderNo}).then(res => {
          this.$message({type: 'success', message: '撤回成功'})
          this.getAddInfo()
          // this.close('Cancel')
        })
      }).catch(err => {
        console.log('err')
      })
    }
  }
};
</script>

<style lang="scss">
.add-container-form{
  .total{
    font-size: 12px;
    line-height: 20px;
    height: 20px;
    margin-bottom: 4px;
    span{
      margin-right: 10px;
    }
  }
  .org{
    font-weight: bold;
    margin-bottom: 4px;
  }
  .so-container{
    .so-total{
      margin: 0;
      line-height: 20px;
      height: 20px;
      overflow: hidden;
      .so-total-flex {
        float: left;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        width: 88.5%;
        padding-right: 20px;
        font-size: 12px;
        .icon-new-cont{
          border: 1px solid #ff4949;
          line-height: 16px;
          width: 16px;
          height: 16px;
          text-align: center;
          font-size: 12px;
          display: inline-block;
          font-style: normal;
          color: #ff4949;
          margin-right: 5px;
        }
        span{
          display: block;
          &.cyTotal {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            em{
              font-style: normal;
              &.red{
                color: #ff4949;
              }
            }
          }
          .quantityTotal {
            max-width: 150px;
            margin-left: 10px;
            overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
          }
          .weightTotal {
            max-width: 200px;
            margin-left: 10px;
          }
          .volumeTotal {
            max-width: 180px;
            margin-left: 10px;
          }
        }
      }
    }
    .new-tip{
      color: #ff4949;
      font-size: 12px;
      line-height: 20px;
    }
    .so-row-cont {
      border: 1px solid #e9e9e9;
      border-radius: 4px;
      margin: 4px 0 0 0;
      overflow: hidden;
    }
    .containerList-show{
      padding: 8px 0 5px;
    }
    .so-row-cont .org-cont{
      padding: 8px 0 4px;
      background-color: #f8f9fd;
    }
    .so-row-cont .containerList-show{
      padding: 0;
    }
    .so-row-cont .row-cont-tit{
      // display: flex;
      background-color: #ebebeb;
      line-height: 24px;
      height: 24px;
      .tit{
        // display: block;
        line-height: 24px;
        // width: 80px;
        font-size: 12px;
        font-weight: 700;
        padding-left: 12px;
        &.red{
          color: #ff4949;
        }
      }
      .so-total{
        flex: 1;
        line-height: 24px;
        height: 24px;
      }
      .row-cont-rt{
        font-size: 12px;
        float: right;
        padding-right: 12px;
      }
    }
  }
  .status-row{
    margin-top: 4px;
    // border-bottom: 1px dotted #e9e9e9;
    // padding-bottom: 10px;
    .item{
      font-size: 12px;
      line-height: 20px;
    }
  }
  .orig-so-container .orig-cont{
    margin: 0;
  }
  .order-info-row {
    .tit {
      background-color: #ebebeb;
      line-height: 24px;
      height: 24px;
      margin-bottom: 6px;
      padding-left: 10px;
    }
    .item {
      line-height: 20px;
      margin-bottom: 4px;
      padding-left: 10px;
    }
  }
}
</style>
