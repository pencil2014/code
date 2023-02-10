<template>
  <div class="container">
    <keep-alive>
      <component
        :companyName="companyName"
        :custid="custid"
        :is="currentComponent"
        :isSelf="isSelf"
        :isLeader="isLeader"
        :orgid="orgid"
        :isWhitelist="isWhitelist"
        :isIndustry="isIndustry"
        :isForeignPeer="isForeignPeer"
        :baseInfo="baseInfo"
        :isBlacklist="isBlacklist"
      />
    </keep-alive>
  </div>

</template>

<script>
import FollowInfo from './followInfo'
import FollowFPInfo from './followFPInfo'
export default {
  name: 'CUSTh',
  label: '跟进记录',
  props: [ 'custid','orgid', 'isLeader', 'isSelf','companyName','isWhitelist','isIndustry','isForeignPeer', 'baseInfo','isBlacklist'],
  components: {
    FollowInfo,
    FollowFPInfo
  },
  data () {
    return {
    }
  },
  created () {
    // console.log('isForeignPeer',this.isForeignPeer)
  },
  computed: {
    currentComponent() {
      return this.isForeignPeer ? FollowFPInfo : FollowInfo
    },
  },
}
</script>
<style scoped>
.container{
  	-moz-user-select: none; /*火狐*/
	  -webkit-user-select: none; /*webkit浏览器*/
	  -ms-user-select: none; /*IE10*/
	  -khtml-user-select: none; /*早期浏览器*/
	  -o-user-select:none;
	  user-select: none;
}
</style>
