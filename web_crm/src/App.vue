<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import { getToken } from '@/utils/auth'
import store from '@/store'

// 心跳检测
let webSocket = null
const heartCheck = {
	// 每隔几秒测试一下心跳是否在继续
	timeout: 50000,
	timeoutObj: null,
	serverTimeoutObj: null,
	start: function() {
		const self = this
		this.timeoutObj && clearTimeout(this.timeoutObj)
		this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
		this.timeoutObj = setTimeout(function() {
			// 这里发送一个心跳，后端收到后，返回一个心跳消息，
			// 任意发一个消息过去，后台接收，在init()中的onmessage收到消息，说明后台没有挂掉，有心跳
			if (webSocket.readyState === 1) {
				webSocket.send('heartbeat')
				self.serverTimeoutObj = setTimeout(function() {
					webSocket.close()
				}, self.timeout)
			}
		}, this.timeout)
	}
}

export default {
	components: {},
	name: 'App',
	data() {
		return {
			repeatArr: [],
			msgArr: [],
			tt: null,
			lockReconnect: false,
			num: -1,
			reConnectNum: 1000,
			reConnectTime: 0
		}
	},
	mounted() {
		// this.createWebSocket()
	},

	methods: {
		// 创建webSocket连接
		createWebSocket() {
			// console.log('process.env', process.env)
			
			if (!getToken()) return
			try {
				// 其实只需要定义一个变量存放后端提供的WebSocket接口地址，然后
				if (location.hostname === 'localhost') {
					webSocket = new WebSocket(`ws://lstest.com/msg/api/ws/${getToken()}`)
				} else if (process.env.VUE_APP_TITLE === 'production') {
					webSocket = new WebSocket(`wss://${location.host}/msg/api/ws/${getToken()}`)
				} else {
					webSocket = new WebSocket(`ws://${location.host}/msg/api/ws/${getToken()}`)
				}
				// 初始化websocket连接
				this.initWebsocket()
			} catch (e) {
				// 如果无法连接上webSocket 那么重新连接！可能会因为服务器重新部署，或者短暂断网等导致无法创建连接
				this.reConnect()
			}
		},
		// 定义重连函数
		reConnect() {
			this.reConnectNum *= 2
			if (this.lockReconnect) {
				return
			}
			this.lockReconnect = true
			// 没连接上会一直重连，设置延迟避免请求过多
			this.tt && clearTimeout(this.tt)
			this.tt = setTimeout(() => {
				this.createWebSocket()
				this.lockReconnect = false
			}, this.reConnectNum)
		},
		// 初始化webSocket连接
		initWebsocket() {
			// WebSocket连接建立之后会调用onopen方法
			webSocket.onopen = e => {
				this.reConnectNum = 1000
				// 建立连接后开始心跳
				// 因为nginx一般会设置例如60s没有传输数据就断开连接  所以要定时发送数据
				heartCheck.start()
			}
			// 当websocket收到服务器发送的信息之后  会调用onmessage方法  getMsg用来封装获取到服务器的消息进行处理，下面会说明
			webSocket.onmessage = e => {
				// 心跳检测重置
				heartCheck.start()
				this.getMsg(e)
			}
			// 当websocket因为各种原因（正常或者异常）关闭之后，会调用onclose方法
			webSocket.onclose = e => {
				this.reConnect()
			}
			// 当websocket因为异常原因（比如服务器部署、断网等）关闭之后，会调用onerror方法
			// 在onerror中需要调用reConnect方法重连服务器
			webSocket.onerror = e => {
				// 连接错误 需要重连
				this.reConnect()
			}
		},
		// 获得消息之后   区别是心跳还是业务信息  如果是业务信息特殊处理（这里就用Element的notify才处理提醒）
		getMsg(e) {
			if (e.data === 'disconnected') {
				this.reConnectTime++
				if (this.reConnectTime > 3) return // 重连3次
				return this.reConnect()
			}
			this.num++
			if (e.data != 'connected' && e.data != 'success' && e.data != 'heartbeat') {
				const notice = JSON.parse(e.data)
				webSocket.send(notice.messageId)
				// 最多弹出5条
				if (this.msgArr.length > 4 || this.repeatArr.includes(notice.messageId)) return
				// 消息id保存到数组
				this.msgArr.push(notice.messageId)
				this.repeatArr.push(notice.messageId)

				const str = notice.sendMessage
				const reg = /'(.*?)'/g

				const res = reg.exec(str)
				const href = res ? res[1] : ''

				this.$notify({
					customClass: 'notice-wrap',
					dangerouslyUseHTMLString: true,
					message: this.$createElement(
						'div',
						{
							style: {
								fontSize: '12px'
							}
						},
						[
							this.$createElement(
								'div',
								{
									style: {
										color: '#222222',
										fontWeight: '700'
									},
									attrs: {
										id: 'notice-' + this.num
									}
								},

								'消息通知 ( 5s )'
							),
							this.$createElement('div', {}, `${notice.sendTitle}`),
							this.$createElement(
								'div',
								{
									style: {
										textAlign: 'right'
									}
								},
								[
									this.$createElement(
										'a',
										{
											style: {
												display: href ? 'inline-block' : 'none',
												color: '#fff',
												width: '64px',
												height: '20px',
												background: '#3E80F5',
												'border-radius': '2px',
												padding: '2px 6px 3px'
											},
											attrs: {
												href,
												target: '_blank'
											}
										},
										`查看详情`
									)
								]
							)
						]
					),
					position: 'bottom-right',
					duration: 5000,
					onClose: () => {
						this.msgArr.shift()
						console.log('🚀 ~ this.msgArr', this.msgArr)
					}
				})
				this.countdown(5, 'notice-' + this.num)
			}
		},
		// 倒计时
		countdown(duration, divId) {
			for (let i = duration; i >= 0; i--) {
				setTimeout(() => {
					document.getElementById(divId) && (document.getElementById(divId).innerText = `消息通知 ( ${i}s )`)
				}, 1000 * (duration - i))
			}
		}
	},
	created() {
		store.dispatch('app/setSPartWidth', 0)
		store.dispatch('app/setTPartHeight', 0)
	},
	destroyed() {
		// webSocket.close()
	}
}
</script>
<style>
/* 解决下拉框选项过长 撑满整个屏幕问题 */
.el-select-dropdown__list {
	max-width: 50vw;
}
.notice-wrap .el-notification__group {
	flex: 1;
}
</style>
