<template>
	<div id="tags-view-container" class="tags-view-container">
		<!-- <div class="left-roll">
      <i class="el-icon-caret-left"></i>
    </div> -->
		<scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
			<router-link
				v-for="(tag, index) in visitedViews"
				ref="tag"
				:key="tag.path + index"
				:class="isActive(tag) ? 'active' : ''"
				:to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
				tag="span"
				class="tags-view-item"
				@click.middle.native="!isAffix(tag) ? closeSelectedTag(tag) : ''"
				@contextmenu.prevent.native="openMenu(tag, $event)"
				@mouseenter.native="tagViewMouseenter(tag)"
			>
				{{ serviceArr.includes(tag.name) ? getTitle(tag) : tag.title }}
				<span v-show="!isAffix(tag) && (visitedViews.length > 1 || tag.name !== 'Dashboard')" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
				<span v-show="visitedViews.length === 1 && tag.name === 'Dashboard'" style="width:11px;height:12px;display:inline-block;vertical-align:-3px;"></span>
			</router-link>
		</scroll-pane>
		<!-- <div class="right-roll">
      <i class="el-icon-caret-right"></i>
    </div> -->
		<ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
			<!-- <li @click="refreshSelectedTag(selectedTag)">刷新</li> -->
			<li @click="copySelectedTag(selectedTag)">复制</li>
			<li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭</li>
			<li @click="closeOthersTags">关闭其他</li>
			<li @click="closeAllTags(selectedTag)">关闭全部</li>
		</ul>
	</div>
</template>

<script>
import ScrollPane from '@/components/ScrollPane'
import path from 'path'
export default {
	components: { ScrollPane },
	data() {
		return {
			visible: false,
			top: 0,
			left: 0,
			selectedTag: {},
			affixTags: [],
			title: '',
			serviceArr: [
				'OrderDetail',
				'RailwayOrderDetail',
				'RailwayFileList',
				'RailwayOrderFee',
				'RailwayBlList',
				'FileBook',
				'FileList',
				'OrderFee',
				'ContainerList',
				'BlList',
				'OrderBook',
				'ShippingTruck',
				'ShippingTruckDetail',
				'Clearance',
				'Warehouse',
				'YardBox',
				'Guarantee',
				'Document',
				'InspectionAndDetection',
				'PodChangeDoc',
				'PodCommClearance',
				'PodFclDelivery',
				'ShippingFclDetail',
				'PodWarehouseIng',
				'LclOrderDetail',
				'JointOrderDetail',
				'ChildOrderList',
				'LclWhBook',
				'DropCabinet',
				'PolLtl',
				'PodLtl',
				'DropCabinet',
				'AirTransportOrderDetail',
				'AirTransportOrderBook',
				'AirTransportMblList',
				'AirTransportHblList',
				'AirPolLtl',
				'AirClearance',
				'AirDocument',
				'GoodsInfo',
				'AirFileBook',
				'AirFileList',
				'AirTransportJointOrderDetail',
				'SoCheck',
				'BehalfRecordManifest',
				'HblPrint',
				'SiDetail',
				'RailwayPutDetail',
				'MblRailwayTakeDetail',
				'RailwayTakeDetail',
				'RailwayTradeTakeDetail',
				'Insurance',
				'AirInsurance'
			]
		}
	},
	computed: {
		visitedViews() {
			return this.$store.state.tagsView.visitedViews || []
		},

		routes() {
			return this.$store.state.permission.routes || []
		}
	},
	watch: {
		$route() {
			this.addTags()
			this.moveToCurrentTag()
		},
		visible(value) {
			if (value) {
				document.body.addEventListener('click', this.closeMenu)
			} else {
				document.body.removeEventListener('click', this.closeMenu)
			}
		}
	},
	mounted() {
		this.initTags()
		this.addTags()
		this.$EventBus.$on('closePage', view => {
			this.closeSelectedTag(view)
		})
	},
	methods: {
		getTitle(tag) {
			let title = tag.title
			let { query, params, name } = tag
			if (params.orderNo || query.orderNo) {
				if (name === 'OrderFee' && query.jointNo) {
					title = tag.title.replace('订单详情', query.jointNo)
				} else {
					title = tag.title.replace('订单详情', params.orderNo || query.orderNo)
				}
			}
			//补料详情title处理
			if (params.blId) {
				title = tag.title.replace(tag.title, `${tag.title}(${query.orderNo})`)
			}
			//放单详情title处理
			if (params.oid) {
				title = tag.title.replace(tag.title, `${tag.title}(${query.orderNo})`)
			}
			return title
		},
		isActive(route) {
			return route.path === this.$route.path
		},
		isAffix(tag) {
			return tag.meta && tag.meta.affix
		},
		filterAffixTags(routes, basePath = '/') {
			let tags = []
			routes.forEach(route => {
				if (route.meta && route.meta.affix) {
					const tagPath = path.resolve(basePath, route.path)
					tags.push({
						fullPath: tagPath,
						path: tagPath,
						name: route.name,
						meta: { ...route.meta }
					})
				}
				if (route.children) {
					const tempTags = this.filterAffixTags(route.children, route.path)
					if (tempTags.length >= 1) {
						tags = [...tags, ...tempTags]
					}
				}
			})
			return tags
		},
		initTags() {
			const affixTags = (this.affixTags = this.filterAffixTags(this.routes))
			for (const tag of affixTags) {
				// Must have tag name
				if (tag.name) {
					this.$store.dispatch('tagsView/addVisitedView', tag)
				}
			}
		},
		addTags() {
			const { name } = this.$route
			if (name) {
				this.$store.dispatch('tagsView/addView', this.$route)
			}
			return false
		},
		moveToCurrentTag() {
			const tags = this.$refs.tag || []
			this.$nextTick(() => {
				for (const tag of tags) {
					if (tag.to.path === this.$route.path) {
						this.$refs.scrollPane.moveToTarget(tag)
						// when query is different then update
						if (tag.to.fullPath !== this.$route.fullPath) {
							this.$store.dispatch('tagsView/updateVisitedView', this.$route)
						}
						break
					}
				}
			})
		},
		refreshSelectedTag(view) {
			this.$store.dispatch('tagsView/delCachedView', view).then(() => {
				const { fullPath } = view
				this.$nextTick(() => {
					this.$router.replace({
						path: '/redirect' + fullPath
					})
				})
			})
		},
		closeSelectedTag(view) {
			this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
				if (this.isActive(view)) {
					// this.$router.go(-1)
					this.toLastView(visitedViews, view)
				}
			})
		},
		closeOthersTags() {
			this.$router.push(this.selectedTag)
			this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
				this.moveToCurrentTag()
			})
		},
		closeAllTags(view) {
			this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
				if (this.affixTags.some(tag => tag.path === view.path)) {
					return
				}
				this.toLastView(visitedViews, view)
			})
		},
		copySelectedTag(view) {
			let routeUrl = this.$router.resolve({
				name: view.name,
				query: view.query
			})
			window.open(routeUrl.href, '_blank')
		},
		toLastView(visitedViews, view) {
			const latestView = visitedViews.slice(-1)[0]
			if (latestView) {
				this.$router.push(latestView.fullPath)
			} else {
				// now the default is to redirect to the home page if there is no tags-view,
				// you can adjust it according to your needs.
				if (view.name === 'Dashboard') {
					// to reload home page
					this.$router.push('/')
					// this.$router.replace({ path: '/redirect' + view.fullPath })
				} else {
					this.$router.push('/')
				}
			}
		},
		openMenu(tag, e) {
			// pre
			// const menuMinWidth = 105
			// const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
			// const offsetWidth = this.$el.offsetWidth // container width
			// const maxLeft = offsetWidth - menuMinWidth // left boundary
			// const left = e.clientX - offsetLeft + 15 // 15: margin right

			// if (left > maxLeft) {
			// 	this.left = maxLeft
			// } else {
			// 	this.left = left
			// }

			// this.top = e.clientY
			this.left = e.clientX
			this.top = e.clientY
			this.visible = true
			this.selectedTag = tag
		},
		closeMenu() {
			this.visible = false
		},
		handleScroll() {
			this.closeMenu()
		},
		tagViewMouseenter(route) {
			// mainly for route with params---now may be no neccesary, because default cache
			if (route && route.meta) {
				route.meta.isUseCache = true
			}
		}
	}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tags-view-container {
	height: 30px;
	width: 100%;
	position: relative;
	padding: 0 30px;
	// background: #fff;
	// border-bottom: 1px solid #d8dce5;
	// box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
	.tags-view-wrapper {
		.tags-view-item {
			display: inline-block;
			position: relative;
			cursor: pointer;
			height: 26px;
			line-height: 26px;
			// border: 1px solid #d8dce5;
			color: #fff; // rgba(255, 255, 255, 0.6)
			// background: #fff;
			padding: 0 1px 0 15px;
			font-size: 12px;
			// margin-left: 5px;
			margin-top: 4px;
			// &:first-of-type {
			//   margin-left: 15px;
			// }
			// &:last-of-type {
			//   margin-right: 15px;
			// }
			&.active {
				background-color: #f5f7f9;
				color: #333;
				// border-color: #42b983;
				// &::before {
				//   content: '';
				//   background: #333;
				//   display: inline-block;
				//   width: 8px;
				//   height: 8px;
				//   border-radius: 50%;
				//   position: relative;
				//   margin-right: 2px;
				// }
			}
		}
	}
	.left-roll,
	.right-roll {
		color: #fff;
		position: absolute;
		top: 0;
		width: 24px;
		height: 30px;
		line-height: 30px;
		float: left;
		// background-color: #fff;
		text-align: center;
		cursor: pointer;
		&:hover {
			background-color: rgba(255, 255, 255, 0.6);
		}
	}
	.left-roll {
		left: 0;
	}
	.right-roll {
		right: 0;
	}
	.contextmenu {
		margin: 0;
		background: #fff;
		z-index: 100;
		position: fixed; // absolute;
		z-index: 4210;
		list-style-type: none;
		padding: 5px 0;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 400;
		color: #333;
		box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
		li {
			margin: 0;
			padding: 7px 16px;
			cursor: pointer;
			&:hover {
				background: #eee;
			}
		}
	}
}
</style>

<style rel="stylesheet/scss" lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
	.tags-view-item {
		.el-icon-close {
			width: 16px;
			height: 16px;
			vertical-align: 2px;
			border-radius: 50%;
			text-align: center;
			transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
			transform-origin: 100% 50%;
			&:before {
				transform: scale(1);
				display: inline-block;
				vertical-align: -3px;
			}
			&:hover {
				background-color: #b4bccc;
				color: #fff;
			}
		}
	}
}
</style>
