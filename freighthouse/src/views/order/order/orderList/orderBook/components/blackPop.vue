<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div class="black-class">
      <div class="tip">Links to the search functionality per brand is available here:</div>
      <div class="item" v-for="(item, index) in options" :key="index">
         <div class="txt" :title="item.name">{{ item.name }}：</div>
         <a :href="item.url" target="_blank">Click here</a>
      </div>
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
export default {
   components: {
    BaseDialog
   },
   props: {
    options: {
      type: Array,
      default:() => {
        return []
      }
    }
   },
   data() {
    return {
      dialogConfig: {
				title: '船司黑名单',
				show: true,
				size: 'medium',
				width: '600px',
				btns: [
           { label: '关闭', action: 'Cancel' },
        ]
			}
    }
   },
   methods: {
    close(action, value) {
			this.$emit('close', action, value)
		},
    dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm')
			} else {
				this.close('Cancel')
			}
		}
   }
}
</script>

<style lang="scss" scoped>
.black-class {
  .tip {
   font-size: 12px;
  }
  .item {
    margin-top: 10px;
    display: flex;
    .txt {
      max-width: calc(100% - 70px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow:ellipsis;
    }
    a {
      width: 70px;
      cursor: pointer;
      color: #1890ff;
    }
  }
}
</style>