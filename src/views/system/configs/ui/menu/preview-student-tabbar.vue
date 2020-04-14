<template>
	<div class="preview-home-page">
		<div class="home-header">
			<div class="header-avatar">
				<img src="http://s1.xiao360.com/common_img/avatar.jpg"/>				
			</div>
			<div class="text-center mt-2">XXX · 8岁</div>
		</div>
		<div class="menu-grid">
			<div class="menu-item" v-for="item in data.home_menu" v-if="item.enable==1">
				<div class="grid-icon"><img :src="item.icon"/></div>
				<div class="grid-label">{{item.label}}</div>
			</div>
		</div>
		<div class="tabbar">
			<div class="tabbar-item" v-for="(item,index) in data.tab_bar" v-if="item.enable" @click="clickBar(item)">
				<div class="tabbar-icon">
					<img :src="item.name==current_bar?item.icon_sel:item.icon">
				</div>
				<div class="tabbar-label">{{item.label}}</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		props: {
			data: {
				type: Object,
				default() {
					return {
						home_menu: [],
						tab_bar: []
					}
				}
			}
		},
		methods: {
			clickBar(item) {
				this.current_bar = item.name
			}
		},
		data() {
			return {
				current_bar: 'home'
			} 
		}
	}
</script>
<style lang="less">
	.preview-home-page {
		position: relative;
		width: 375px;
		height: 667px;
		margin: 0 auto;
		border: 1px solid #f1f1f1;
		.lesson-page {
			background: #eff4f8;
			height: 100%;
			.lesson-menu-cell {
				position: relative;
				display: flex;
				align-items: center;
				height: 70px;
				padding: 10px 15px;
				background: #fff;
				.cell-title {
					flex: 1;
				}
				.cell-icon {
					flex: 0 0 40px;
				}
				&:last-child {
					&:after {
						width: 0; 
					}
				}
				&:after {
				    content: "";
				    width: 95%;
				    height: 1px;
				    background: #eee;
				    position: absolute;
				    bottom: 0;
				    right: 0;
				}
			}
		}
		.event-page{
			.event-item {
			    margin: 10px;
			    border-radius: 5px;
			    overflow: hidden;
			    display: flex;
			    flex-direction: row;
			}
			.event-scope-name {
			    width: 98px;
			    height: 85px;
			    font-size: 20px;
			    background: #35aef8;
			    color: #fff;
			    text-align: center;
			    display: flex;
			    justify-content: center;
			    align-items: center;
			}
			.event-scope-bg{
				flex: 1;
    			background-size: cover;
			}
		}
		.home-header {
			color: #fff;
			height: 185px;
			background-image: url('/static/img/student/home_bg.png');
	    	background-size: 100% 100%;
	    	.header-avatar {
	    		width: 70px;
	    		margin: 0 auto;
	    		padding-top: 25px;
	    		>img {
	    			border-radius: 50%;
				    width: 70px;
				    height: 70px;
				    vertical-align: middle;
	    		}
	    	}
	    	.current-role {
	    		position: absolute;
	    		top: 20px;
	    		right: 10px;
			    padding: 3px 11px;
			    border: 1px solid #fff;
			    border-radius: 20px;
			    font-size: 12px;
	    	}
		}
		.menu-grid {
			display: flex;
			flex-flow: row wrap;
			align-content: flex-start;
			width: 375px;
			.menu-item {
				flex: 0 0 33.33%;
				height: 100px;
				padding: 20px 10px;
				border-bottom: 1px solid #f1f1f1;
				border-right: 1px solid #f1f1f1;
				&:nth-child(3n) {
					border-right: none; 
				}
				>.grid-icon {
					width: 50px;
					height: 50px;
					margin: 0 auto;
					>img {
						width: 100%;
						height: 100%;
					}
				}
				>.grid-label {
					margin-top: 5px;
					color: #AAAAAA;
					text-align: center;
					font-size: 14px;
				}
			}
		}
		.tabbar {
			display: flex;
			position: absolute;
			bottom: 0;
			width: 100%;
			background: #fff;
			.tabbar-item {
				flex: 1;
				text-align: center;
				padding-top: 6px;
				border-top: 1px solid #f1f1f1;
				cursor: pointer;
				>.tabbar-icon {
					width: 22px;
					height: 22px;
					margin: 0 auto;
					>img {
						width: 100%;
						height: 100%;
					}
				}
				>.tabbar-label {
					color: #999;
				}
			}
		}
	}
</style>