<template>
  <div v-if="soList.length">
    <el-alert type="warning" :closable="false" class="gray">
      <template slot="title">
        <span class="txt"> 以下SO {{ soStr }} 当前还未做柜，请在 {{ replyTime }} 前回复做柜进展。 <el-button type="text" size="mini" @click="reply()">回复</el-button> </span>
      </template>
    </el-alert>
    <div v-if="arkReplyPopShow">
      <arkReplyPop :soList="soList" :replyTime="replyTime" @close="arkReplyPopClose" />
    </div>
  </div>
</template>

<script>
import arkReplyPop from './arkReplyPop'
import { getSoUnReplyList } from '@/api/order/book/list'
export default {
  components: {
    arkReplyPop
  },
  data() {
    return {
      arkReplyPopShow: false,
      soList: [],
      replyTime: '',
      soStr: '',
    }
  },
  created() {
    this.getSoUnReplyListData()
  },
  methods: {
    getSoUnReplyListData() {
      getSoUnReplyList(this.$route.query.orderNo)
      .then(res => {
        if (res.data) {
          this.soStr = res.data.so
          this.soList = res.data.list || []
          this.replyTime = res.data.replyTime
        } else {
          this.soList = []
        }
        this.$store.dispatch('order/calcShipInfoHeightSwitch')
      })
    },
    reply() {
      this.arkReplyPopShow = true
    },
    arkReplyPopClose(action) {
      this.arkReplyPopShow = false
			if (action === 'Confirm') {
				this.getSoUnReplyListData()
			}
    }
  }
}
</script>

<style>

</style>