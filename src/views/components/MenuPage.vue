<template>
	<div class="menu-page">
		<Menu mode="horizontal" :active-name="current_menu_index" :class="{'customer-menu':min}">
        	<router-link :to="parentPath+'/'+item.path" v-for="(item,index) in subNavs">
        		<MenuItem :name="index">{{item.text||item.meta.title}}</MenuItem>
        	</router-link>      
	    </Menu>
	    <router-view :class="subClass"></router-view>
	</div>
</template>

<script>	
	import {map} from '@/router'
	import common from '@/libs/common.mixin'
	export default{
		mixins: [common],
		props: {
			parentName: {
				type: String,
				default: ()=>{
					return ''
				}
			},
			subClass: {
				type: String,
				default: ()=> {
					return 'menu-page-router-view'
				}
			},
			navFrom: {
				type: String,
				default: ''
			},
			min: {
				type: Boolean,
				default: false
			},
			checkPer:{
				type:Boolean,
				default:false
			},
			perPrefix:{
				type:String,
				default:''
			}
		},
		data () {
			return {
				
			}
		},
		mounted() {
			this.scrollBottom()
		},
		watch:{
			'$route.path':function(){
				if(!this.current_menu) {
					this.$router.push({path:this.first_menu})
				}
				this.scrollBottom()
			}
		},		
		methods: {
			scrollBottom() {
				if(this.navFrom === 'router') {
					setTimeout(() => {
						let container = document.getElementsByTagName('html')[0]
						container.scrollTop = container.scrollHeight
					},500)
				}
			}
		},
		computed: {
			subNavs(){
				if(this.navFrom == 'router') {
					let child_navs = map[this.parentName].children
					if(!this.checkPer){
						return child_navs
					}
					let navs = []
					child_navs.forEach(nav=>{
						let per = this.perPrefix+'.'+nav.path
						if(this.hasPer(per)){
							navs.push(nav)
						}
					})
			
					return navs
				}
				let name = this.parentName.replace(/\_/g,'.')
				let navs = this.$store.state.gvars.navs.main
				let subnav = []
				let pos = name.indexOf('.')
				if(pos !== -1){
					let puri = name.substr(0,pos)
					navs = navs.find(m=>m.uri == puri).sub
				}
				if(typeof navs !== 'undefined' && typeof navs.find(m=>m.uri===name)){					
					subnav = navs.find(m=>m.uri===name).sub
				}
				subnav.forEach(nav => {
					let cursor = nav.uri.indexOf('.')
					nav.path = nav.uri.substr(cursor+1)
				})
				return subnav
			},
			current_menu_index() {
				let arr = this.$route.path.split('/')
				return this.subNavs.findIndex(item => 
					item.path == arr[arr.length-1]
				)
			},
			current_menu() {
				let arr = this.$route.path.split('/')
				let cm = this.subNavs.find(item => item.path == arr[arr.length-1])
				if(cm) {
					return cm.path
				}else{
					return ''
				}
			},
			first_menu() {
				if(this.subNavs.length) {
					return this.parentPath + '/' + this.subNavs[0].path	
				}
			},
			parentPath(){
				let path
				if(this.$route.name === this.parentName){
					path = this.$route.path
				}else{
					path = this.$route.path
					let rpos = path.lastIndexOf('/')
					path = path.substr(0,rpos)
				}
				return path	
			}
		}
	}
</script>
<style lang="less">
	.menu-page {
		.ivu-menu-light {
			background: #eff4f8;
		}
		.ivu-menu {
			z-index: 1;
			&.customer-menu {
				height: 30px;
				line-height: 30px;
			}
		}
		&-router-view {
			margin-top: 16px;
		}
		.ivu-menu a li{
			padding: 0 15px;
		}
		.customer-menu a li.ivu-menu-item{
			padding:0 8px;
		}
	}
</style>