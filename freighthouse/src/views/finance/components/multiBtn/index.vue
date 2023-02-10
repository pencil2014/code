<template>
  <div class="multi__button">
    <template v-for="item in btnArr">
      <span
        v-if="item.voucher && item.voucher!=='null'"
        :key="item.voucher"
        @click.stop="action(item)"
      >{{item.voucher}}</span>
    </template>
    <!-- 此按钮只会在详情页显示，有此按钮必会有凭证操作权限限制，利用当前路由的值即可 -->
    <PreviewDialog
      :dialogOption="previewDialog"
      @generate="$emit('generate', $event)"
      :showDel="checkAuth($route.name, 'btn-voucherDel') || checkAuth($route.name, 'btn-delVoucher')"
      :showCreate="checkAuth($route.name, 'btn-voucherCreate') || checkAuth($route.name, 'btn-voucherNo')"
    />
  </div>
</template>

<script>
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  name: 'multiBtn',
  mixins: [mixin],
  components: {
    PreviewDialog,
  },
  props: {
    btnStr: { type: String, default: '' },
    isEx: { type: Boolean, default: false },
  },
  computed: {
    btnArr() {
      let arr = []
      if (this.btnStr) {
        arr = this.btnStr.split(',').map((item) => {
          let arr1 = item.split('/')
          return { voucher: arr1[1], acctVoucherSeqno: arr1[0] }
        })
      }
      console.log(arr)
      return arr
    },
  },
  data() {
    return {
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        showData: {},
        isEx: this.isEx,
      },
    }
  },
  methods: {
    action(item) {
      this.previewDialog.showData = ''
      this.previewDialog.seqNo = item.acctVoucherSeqno
      this.previewDialog.show = true
    },
  },
}
</script>

<style scoped lang="scss">
.multi__button {
  display: inline;
  span {
    display: inline-block;
    color: #3e80f5;
    text-decoration: underline;
    cursor: pointer;
    margin-left: 4px;
    &::after {
      color: #222222;
      content: ',';
    }
    &:nth-last-of-type(1)::after {
      content: '';
    }
  }
}
</style>
