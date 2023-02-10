<template>
  <div class="edit-func-cont-1">
    <el-carousel
      direction="vertical"
      :autoplay="true"
      height="40px"
      :loop="true"
      indicator-position="none"
      :interval="8000"
    >
      <el-carousel-item v-for="(item, index) in optionList" :key="index">
        <div class="edit-func-cont-conter">
          <div class="edit-footer-title">
            <span>标题：{{ item.title }}</span>
          </div>
          <div class="operation-btns-box">
            <span class="row-tit-label">
              <span>{{ "发布人：" + item.createdName }}</span>
              发布时间：{{ item.createdTime }}
            </span>
            <el-button size="mini" type="text" ref="btnCancel" @click="handleRouter">更多</el-button>
          </div>
          <div class="edit-footer-info">内容：{{ item.content }}</div>
        </div>
      </el-carousel-item>
    </el-carousel>
    <!-- <div
			class="edit-func-cont-conter myMove2 inner-container"
			v-for="(item, index) in optionList"
			:key="index"
		>
			<div class="edit-footer-info">
				<span>{{ item.content }}</span>
			</div>
			<div class="operation-btns-box">
				<span class="row-tit-label">
					<span>{{ "发布人：" + item.createdName }}</span
					>发布时间:{{ item.createdTime }}</span
				>
				<el-button
					size="mini"
					type="text"
					ref="btnCancel"
					@click="handleRouter"
				>
					更多
				</el-button>
			</div>
    </div>-->
  </div>
</template>

<script>
import { messageList } from '@/api/bkg/stockApply'
export default {
  data() {
    return {
      optionList: [],
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 消息列表
    getData() {
      let data = {
        currPage: 1,
        pageSize: 10,
        query: [],
      }
      messageList(data)
        .then((res) => {
          this.optionList = res.data.list.splice(0, 3)
          console.log(this.optionList)
        })
        .catch(() => {})
    },
    handleRouter() {
      this.isJumpRouteFromPage = true
      this.$router.push({
        name: 'BkgManageList',
        query: {},
      })
    },
  },
}
</script>

<style lang='scss'>
.edit-func-cont-1 {
  position: relative;
  padding: 0;
  // padding-bottom: 12px;
  height: 40px;
  overflow: hidden;
  margin: 12px 12px -4px 12px;
  background-color: #fff;
  padding: 0 6px;
  // background: #fdf2e8;
  color: #ef8519;
  .edit-func-cont-conter {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    & > div {
      line-height: 20px;
      height: 20px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .edit-footer-title {
      flex-basis: 50%;
      font-weight: bold;
    }
    .operation-btns-box {
      flex-basis: 50%;
      text-align: right;
    }
    .edit-footer-info {
      flex-basis: 50%;
    }
  }
}
// .edit-func-cont .row-tit-label {
//   font-size: 12px;
//   margin-right: 20px;
// }
// .edit-func-cont .row-tit-label em {
//   color: #3E80F5;
//   margin-left: 5px;
//   font-style: normal;
// }
// .edit-func-cont .operation-btns-box .el-checkbox__label{
//   line-height: 28px;
//   font-size: 12px;
// }
// .edit-func-cont .operation-btns-box .el-checkbox{
//   margin-right: 20px;
// }

.inner-container {
  animation: myMove 8s linear infinite;
  animation-fill-mode: forwards;
}
/*文字停顿滚动*/
@keyframes myMove {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-150px);
  }
}
// @keyframes myMove {
//   0% {
//     transform: translateY(0);
//   }
//   10% {
//     transform: translateY(-30px);
//   }
//   20% {
//     transform: translateY(-30px);
//   }
//   30% {
//     transform: translateY(-60px);
//   }
//   40% {
//     transform: translateY(-60px);
//   }
//   50% {
//     transform: translateY(-90px);
//   }
//   60% {
//     transform: translateY(-90px);
//   }
//   70% {
//     transform: translateY(-120px);
//   }
//   80% {
//     transform: translateY(-120px);
//   }
//   90% {
//     transform: translateY(-150px);
//   }
//   100% {
//     transform: translateY(-150px);
//   }
// }
</style>