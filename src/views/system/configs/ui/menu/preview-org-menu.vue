<template>
	<div class="preview-home-page">
		<div class="home-header">
			<div class="header-avatar">
				<img src="http://s1.xiao360.com/common_img/avatar.jpg"/>				
			</div>
			<div class="text-center mt-2">X{{'老师'|translate}} · 男</div>
			<div class="current-role">
				<Icon type="person"></Icon>
				<span>{{data.rid|role_name}}</span>
			</div>
		</div>
		<div class="menu-grid" v-if="data.config">
			<div class="menu-item" v-for="(item,index) in data.config.home_menu" :key="index" v-show="item.enable==1 && (item.rids.indexOf(data.rid)!==-1 || item.rids.length == 0)">
				<div class="grid-icon"><img :src="item.icon"/></div>
				<div class="grid-label">{{item.label}}</div>
			</div>
		</div>
		<div class="tabbar">
			<div class="tabbar-item" v-for="(item,index) in data.config.tab_bar" :key="index" v-show="data.rid == 0 || item.per.length ==0 || item.per.indexOf(data.rid)!==-1 " @click="clickBar(item)">
				<div class="tabbar-icon">
					<img :src="item.name==current_bar?item.icon_sel:item.icon">
				</div>
				<div class="tabbar-label">{{item.label}}</div>
			</div>
		</div>
	</div>
</template>
<script>
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [globals],
		props: {
			data: {
				type: Object,
				default() {
					return {
						config: {
							home_menu: []
						}
					}
				}
			}
		},
		data() {
			return {
				
			} 
		}
	}
</script>