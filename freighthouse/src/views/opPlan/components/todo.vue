<template>
  <div class="todo-class">
    <div class="server-name">
      <div class="title">服务项：</div>
      <div class="service-list">
        <div class="btn-class"  v-for="(item, index) in showServiceInfoList" :key="index">
          <el-button  :type="item.btnType"  size="mini" @click="toScrollHeight(item)">{{ item.serviceName }}</el-button>
        </div>
      </div>
    </div>
    <!-- <div class="todo" v-if="checkBoxList.length">
      <div class="title">工作项：</div>
      <div class="checkbox-class">
        <div class="item" v-for="(item, index) in checkBoxList" :key="index">
          <img v-if="item.checked" class="img-class" :src="require('@/views/opPlan/images/finish.png')" alt="">
          <img v-else  class="img-class" :src="require('@/views/opPlan/images/nofinish.png')" alt="">
          <div class="item-name">{{ item.name }}</div>
          <el-popover
            placement="bottom"
            min-width="150"
            :id="'id-'+index"
            :ref="'ref-'+index"
            v-model="item.visible">
            <div style="display: flex; justify-content: center;align-items:center;">
              <span style="font-size: 12px;">{{ item.name }}：</span>
              <span style="width: 85px;">
                 <el-select size="mini" v-model="item.status" placeholder="请选择">
                  <el-option
                    v-for="o in selectOptions"
                    :key="o.value"
                    :label="o.label"
                    :value="o.value">
                  </el-option>
                </el-select>
              </span>
            </div>
            <div style="text-align: right; margin-top: 20px;">
              <el-button type="primary" size="mini" @click="change(item)">确定</el-button>
              <el-button size="mini" type="default" @click="item.visible = false">取消</el-button>
            </div>
            <img slot="reference" class="img-class img-right" :src="require('@/views/opPlan/images/edit.png')" alt="">
          </el-popover>
        </div>
     </div>
    </div> -->
  </div>
  
</template>

<script>
import { getPlanTodoList, planTodoFinish, planTodoUnFinish } from '@/api/order/opPlan.js'
export default {
  props: {
     orderInfo: {
       type: Object,
       default: () => {
         return {}
       }
     },
     polDeclarationArr: {
      type: Array,
      default: () => {
        return []
      }
     }
  },
  data() {
    return {
      scrollIdsObj: {
         'book': 'DC',
         'proxy_book': 'DC',
         'truck': 'QYGTG',
         'pol_ltl': 'QYGSC',
         'pol_warehouse': 'QYGCC',
         'pol_declaration': 'QYGBG',
         'TD': 'TD',
         'pod_change_doc': 'MDGHD',
         'pod_comm_clearance': 'MDGWTQG',
         'pod_ltl_delivery': 'MDGSCPS',
         'pod_fcl_delivery': 'MDGTGPS',
         'pod_warehouse': 'MDGCC',
      },
      selectOptions: [
        {
          label: '已完成',
          value: 'done'
        },
        {
          label: '未完成',
          value: 'todo'
        }
      ],
      visible: false,
      checkBoxList: []
    }
  },
  created() {
    this.init()
  },
  computed: {
    serviceInfoList() {
      return this.orderInfo.serviceInfoList || []
    },
    showServiceInfoList() {
       let arr = []
       this.serviceInfoList.forEach(item => {
          arr.push({
            ...item,
            scrollId: this.getScrollId(item),
            btnType: item.serviceStatus === 'finish' ? 'primary' : 'default'
          })
          if (['book', 'proxy_book'].includes(item.serviceCode)) {
             arr.push({
                serviceName: '提单',
                scrollId: this.scrollIdsObj['TD'] || '',
                btnType: arr.some(o => ['book', 'proxy_book'].includes(o.serviceCode) && o.serviceStatus === 'finish') ? 'primary' : 'default'
              })
          }
       })
       return arr
     },
  },
  methods: {
    init() {
      // getPlanTodoList({
      //   orderNo: this.$route.query.orderNo
      // }).then(res => {
      //   if(res && res.data) {
      //     let list = res.data.sort(this.sortBy('sort'))
      //     this.checkBoxList = list.map(item => {
      //       item['checked'] = item.status === 'done'
      //       item['visible'] = false
      //       return item
      //     })
      //   }
      // })
    },
    sortBy(param) {
       return (x, y) => {
         return x[param] - y[param]
       }
    },
    change(item) {
      console.log(item)
      let params = {
        orderNo: this.$route.query.orderNo,
        code: item.code
      }
      let requestUrl = item.status === 'done' ? planTodoFinish : planTodoUnFinish
      requestUrl(params)
      .then(res => {
        this.$message.success('修改成功')
        item.visible = false
        this.init()
      })
      .catch(() => {
        item.visible = false
      })
    },
     getScrollId(item) {
        if (item.serviceCode === 'pol_declaration') {
          if (!this.polDeclarationArr.length || this.polDeclarationArr.includes('pol_declaration')) {
            return this.scrollIdsObj[item.serviceCode] || ''
          } else {
            return 'QYGBJ'
          }
        } else {
          return this.scrollIdsObj[item.serviceCode] || ''
        }
     },
     toScrollHeight(item) {
       if (item.scrollId) {
         this.$emit('goToScrollHeight', item.scrollId)
       } else {
        return
       }
     }
  }
}
</script>

<style lang="scss" scoped>
.todo-class {
  margin-top: 8px;
  background-color: #ffffff;
  padding: 15px 16px;
}
.server-name {
  display: flex;
  align-items: center;
  .title {
    color: #222222;
    font-weight: bold;
    width: 50px;
  }
  .service-list {
    flex: 1;
    display: flex;
    .btn-class {
      text-align: center;
    }
    .btn-class+.btn-class {
      margin-left: 20px;
    }
  }
  
}
.todo {
  margin-top: 20px;
  display: flex;
  align-items: center;
  .title {
    color: #222222;
    font-weight: bold;
    width: 50px;
    margin-bottom: 2px;
  }
  .checkbox-class {
    width:calc(100% - 50px);
    display: flex;
    .item {
      display: flex;
      .item-name {
        margin-left: 5px;
      }
      .img-right {
        margin-left: 5px;
        cursor: pointer;
      }
    }
    .item+.item {
      margin-left: 40px;
    }
  }
}
.img-class {
  width: 12px;
  height: 12px;
}
</style>