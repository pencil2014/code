<template>
  <div class="dialog-layout">
    <el-dialog
      class="abow-dialog"
      :title="config.title"
      :visible.sync="config.show"
      :width="config.width || Config.dialogWidth[config.size || 'big']"
      :fullscreen="config.fullscreen"
      :modal="config.modal"
      :show-close="!config.notShowClose"
      :close-on-click-modal="false"
      :center="config.center"
      :before-close="beforeClose"
    >
      <slot />
      <span slot="footer" class="dialog-footer" v-if="showBtns">
        <el-button
          size="mini"
          v-for="(item, index) in getBtns()"
          :key="index"
          :type="item.type"
          @click="footerBtnEvents(item.action)"
        >
          {{ item.label }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import { sleep } from "@/utils/tools";
import Config from '@/components/Base/config';

export default {
  name: 'Dialog',
  data() {
    return {
      hookFlag: false,
      Config: Config,
    };
  },
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
    callback: {
      type: Function,
      default: () => ({}),
    },
    tableConfig: {
      type: Object,
      default: () => ({}),
    },
  },
  created() {},
  mounted() {},
  components: {},
  computed: {
    showBtns() {
      return this.config.showBtns === false ? false : true;
    },
  },
  methods: {
    getBtns() {
      let { btns = [] } = this.config;
      if (btns.length) return btns;
      return [
        { label: '确定', action: 'Confirm', type: 'primary' },
        { label: '取消', action: 'Cancel' },
      ];
    },
    setState(val) {
      Object.assign(this.config, {
        show: val,
      });let VMODAL = document.querySelector('body > .v-modal');if (VMODAL) { VMODAL.style.display = 'none' }
    },
    async beforeClose(done) {
      if (this.tableConfig.list) {
        for (let i = 0; i < this.tableConfig.list.length; i++) {
          if (!this.tableConfig.list[i].commodityName) {
            // 点击取消或者关闭dialog时，删除货物信息中的空数据（暂时以commodityName判断）
            this.tableConfig.list.splice(i, 1);
          }
        }
      }
      let { closeHook } = this.config;
      let action = done;

      if (this.hookFlag) return;

      if (typeof done === 'function') {
        action = 'Close';
      }

      if (!closeHook) {
        this.setState(false);
        this.callback(action);
        return;
      }

      this.hookFlag = true;
      let res = await closeHook(action);
      if (res) {
        this.setState(false);
        this.callback(action);
      }
      this.hookFlag = false;
    },
    footerBtnEvents(action) {
      console.log(action);
      if (action === 'Cancel') {
        return this.beforeClose(action);
      } else {
        if (this.tableConfig.list) {
          for (let i = 0; i < this.tableConfig.list.length; i++) {
            if (!this.tableConfig.list[i].commodityName) {
              this.$message.error('中文品名不能为空');
              return;
            }
          }
        }
        this.callback(action, () => {
          this.setState(false);
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../less/dialog_layout.scss';
</style>
