<template>
  <div class="startEnd">
     <div class="content">
        <div class="item" v-for="(item, index) in showList" :key="index">
          <div class="key">{{item.label}}：</div>
          <div class="value">{{item.value}}</div>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  props: {
     orderInfo: {
       type: Object,
       default: () => {
         return {}
       }
     },
     checkpointList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      options: [
         {
           label: '截港时间',
           pointCode: 'TERMINAL_CUT_OFF',
           haveShow: true, // 接口返回了才展示，否则整个都不展示
         },
         {
           label: '预计靠泊时间',
           pointCode: 'PRE_BERTHING',
           haveShow: true,
         },
         {
           label: '预计离泊时间',
           pointCode: 'PRE_UNBERTHING',
           haveShow: true,
         },
         {
           label: '截补料',
           pointCode: 'SI_CUT_OFF',
           format: 'YYYY-MM-DD HH',
         },
         {
           label: '截VGM',
           pointCode: 'VGM_CUT_OFF',
           format: 'YYYY-MM-DD HH',
         },
         {
           label: '截舱单',
           pointCode: 'MANIFEST_CUT_OFF',
           haveShow: true,
         },
         {
           label: '预计开船时间',
           pointCode: 'ETD',
           format: 'YYYY-MM-DD',
         },
         {
           label: '预计到港时间',
           pointCode: 'ETA',
           format: 'YYYY-MM-DD',
         }
      ]
    }
  },
  computed: {
    showList() {
      return this.options.filter(item => {
        return !item.haveShow || item.value
      })
    }
  },
  watch: {
    'checkpointList': {
      handler(val) {
         this.init()
      },
      deep: true
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let obj = {}
      this.options = this.options.map(item1 => {
        obj = this.checkpointList.find(item2 => {
        return (item2.pointCode === item1.pointCode && item2.source === 'oss')
        }) || {}
        return Object.assign(item1, {
          value: this.mapDate(item1.format, obj)
        })
      })
    },
    mapDate(format, obj) {
       if (obj.bizTime) {
         if (format === 'YYYY-MM-DD') {
            return obj.bizTime.slice(0, 10)
         } else if (format === 'YYYY-MM-DD HH') {
            return obj.bizTime.slice(0, 13)
         } else if (format === 'YYYY-MM-DD HH:mm') {
            return obj.bizTime.slice(0, 16)
         } else {
            return obj.bizTime
         }
       } else {
         return ''
       }
    },
  }
}
</script>

<style lang="scss" scoped>
.startEnd {
  margin-top: 8px;
  background-color: #ffffff;
  padding: 10px 16px 30px;
  .content {
    display: flex;
    flex-wrap: wrap;
    .item {
      width: 25%;
      display: flex;
      margin-top: 12px;
    }
  }
}
</style>