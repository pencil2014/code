<template>
  <div class="msk-box">
    <div class="water-mark-box"></div>
    <div class="crm-cnt">
      <router-view/>
    </div>
  </div>
</template>
<script>
import { getForeignCity, getDomesticCity } from '@/api/base'
import watermark from '@/utils/watermark'
export default {
  provide() {
    return {
      isReview: false,
      emailRules: [
        { required: true, message: ' ', trigger: 'blur' },
        // { required: true, message: '请输入Email', trigger: 'blur' },
        { type: 'email', message: ' ', trigger: ['blur', 'change'] },
      ],
      telRules: [
        // { required: true, message: '请输入电话号码', trigger: 'blur' },
        { required: true, message: ' ', trigger: 'blur' },
        // {
        //   validator: (r, v, fn) => (/^1[3456789]\d{9}$/.test(v) ? fn() : fn(true)),
        //   message: ' ',
        //   trigger: ['blur', 'change'],
        // },
      ],
      defaultRules: { required: true, message: ' ', trigger: ['blur', 'change'] },
      yzbmRues: {
        validator: (r, v, fn) => {
          var reg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]", 'g')
          reg.test(v)
          rs ? fn() : fn(true)
        },
        message: ' ',
        trigger: ['blur', 'change'],
      },
      foreignCity: this.foreignCity,
      domesticCity: this.domesticCity,
      differentField: []
    }
  },
  data() {
    return {
      foreignCity: [],
      domesticCity: [],
    }
  },
  mounted() {
    // getForeignCity({}).then((res) => {
    //   this.foreignCity.splice(0, 1000, ...this.getTreeData(res.data || []))
    //   this.count += 1
    //   console.log('root:``````' + JSON.stringify(this.foreignCity).slice(30, 60))
    // })
    // getDomesticCity({}).then((res) => {
    //   this.domesticCity.splice(0, 1000, ...this.getTreeData(res.data || []))
    //   this.count += 1
    //   console.log('root:``````' + JSON.stringify(this.domesticCity).slice(30, 60))
    // })
    // 初始化水印
    this.reloadWathermark()
    // 监听缩放重新渲染水印
    window.addEventListener('resize', this.reloadWathermark)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.reloadWathermark)
  },
  methods: {
    //处理最后一级children为空数组问题
    getTreeData(data) {
      // 循环遍历json数据
      for (var i = 0; i < data.length; i++) {
        if (data[i].children.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.getTreeData(data[i].children)
        }
      }
      return data
    },
    // 渲染水印
    reloadWathermark () {
      // 删除之前的水印
      document.querySelector('.water-mark-box').innerHTML = ''
      // 重新渲染水印
      let userInfo = this.$store.state.user.userInfo
      let { deptName, userName, mobileNo = '', employeeNo } = userInfo
      // let text = `${deptName}_${userName}_${mobileNo.slice(-4) || employeeNo}`
      let text = `${userName}_${employeeNo}`
      watermark({
        watermark_txt: text, 
        className:'water-mark-box',
        watermark_zindex: 6, 
      })
      // watermark({watermark_txt: text, className:'water-mark-box',watermark_alpha: '0.3'})
    }
  },
}
</script>
<style lang="scss" scoped>
$horizon: 8px;
$vertical: 8px;
::v-deep {
  font-size: 14px;
  // line-height: 20px;
  // .money-box {
  //   padding-top: 12px;
  //   padding-bottom: 12px;
  // }
  .el-input__prefix {
    line-height: 20px;
    color: #c0c4cc;
  }
  .el-button-group {
    margin-right: 10px;
  }
  .info-page {
    padding: $vertical $horizon $vertical;
    .info-title {
      height: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
      font-size: 14px;
      font-weight: 600;
      color: #222222;
      & > div {
        font-size: 12px;
      }
    }
  }
  .el-divider--horizontal {
    margin: 0 0 8px 0;
  }
  .success-content .el-steps {
    width: 90%;
    margin: 0 auto;
    p {
      font-weight: normal;
    }
  }
  .base-info-list {
    li {
      display: inline-block;
      line-height: 16px;
      margin-bottom: 4px;
      width: 320px;
      font-size: 12px;
      vertical-align: top;
      &.block-li {
        // width: 640px;
        display: block;
        width: 100%;
      }
    }
  }
  .el-form-item--mini.el-form-item {
    margin-bottom: 4px;
  }
  // [class*='-select'],[class*='-input'],[class*='-button'],[class*='-group'],[class*='-date'],[class*='-checkbox'] {
  //   z-index: 2;
  // }
  // [class*='el-select__tags'] {
  //   z-index: 3;
  // }
}
</style>
