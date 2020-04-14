<template>
	<div class="preview-home-page">
		<template v-if="current_bar=='home'">
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
		</template>
		<template v-if="current_bar=='lesson'">
			<div class="lesson-page">
				<div class="lesson-menu-cell" v-for="item in data.lesson_menu" v-if="item.enable==1">
					<div class="cell-icon">
						<img :src="item.icon" width="50%" />
					</div>
					<div class="cell-title">
						{{item.label}}
					</div>
					<Icon type="chevron-right"></Icon>
				</div>
			</div>
		</template>
		<template v-if="current_bar=='edu'">
			<div class="lesson-page">
				<div class="lesson-menu-cell" v-for="item in data.edu_menu" v-if="item.enable==1">
					<div class="cell-icon">
						<img :src="item.icon" width="50%" />
					</div>
					<div class="cell-title">
						{{item.label}}
					</div>
					<Icon type="chevron-right"></Icon>
				</div>
			</div>
		</template>
		<template v-if="current_bar=='event'">
			<div class="event-page">
				<div class="event-item" v-for="item in data.event_menu" v-if="item.enable==1">
					<div class="event-scope-name">
						{{item.label}}
					</div>
					<div class="event-scope-bg" :style="{backgroundImage: 'url('+item.icon+')'}"></div>
				</div>
			</div>
		</template>
		<template v-if="current_bar=='my'">
			<div class="lesson-page preview-mobile-mine">
				<div class="mine-header">
					<div class="content">
						<div class="header-avatar pull-left">
							<img src="http://s1.xiao360.com/common_img/avatar.jpg"/>				
						</div>
						<div class="header-info pull-left">
							<span>XXX · 8岁</span>
							<p class="mt-3">186****6286</p>
						</div>
					</div>
				</div>
				
				<div class="mine-menu">
					<div class="x-mine-cell" v-for="item in data.my_menu" v-if="item.enable==1">
						<div class="cell-img">
							<img class="cell-icon" :src="item.icon" v-if="item.icon.indexOf('.')>-1">
							<Icon class="cell-icon" :type="item.icon" v-else></Icon>
						</div>
						<div class="cell-title">
							<p>{{item.label}}</p>
						</div>
						<Icon type="ios-arrow-right"></Icon>
					</div>
				</div>
			</div>
		</template>
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
