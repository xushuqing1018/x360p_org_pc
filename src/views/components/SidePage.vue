<template>
	<div class="side-page">
		<div class="left-nav" :style="styles1">
			<sub-navs :section="section" @collapsed="collapsed"></sub-navs>
		</div>
		<div class="right-content" :style="styles2">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
	import SubNavs from 'c%/SubNavs.vue'
	export default{
		components:{
			SubNavs
		},
		props: {
			section: String
		},
		data() {
			return {
				is_collapsed: false
			}
		},
		computed: {
			styles1() {
				let styles = {
					left: 0
				}
				if(this.is_collapsed) {
					styles.left = '-200px'
				}
				return styles
			},
			styles2() {
				let styles = {
					marginLeft: '212px'
				}
				if(this.is_collapsed) {
					styles.marginLeft = '12px'
				}
				return styles
			}
		},
		methods: {
			collapsed(v) {
				this.is_collapsed = v
			}
		}
	}
</script>
<style lang="less">
	.side-page {
		position: relative;
		width: 100%;
		height: 100%;
		.left-nav {
			position: absolute;
			left: 0;
			width: 200px;
			transition: all .3s ease;
		}
		.right-content {
			margin-left: 212px;
			min-height: 500px;
		    background: #fff;
		    border-radius: 2px;
		    padding: 5px;
		    box-shadow: 0 1px 2px rgba(0,0,0,.1);
		    transition: all .3s ease;
		}
	}
</style>