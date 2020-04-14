<style lang="less">

.m-b{margin-bottom:15px}
.side-sub-nav{
	position: relative;
	background-color: #fff;
	padding-top:10px;
	border-radius: 5px;
	min-height: 400px;
	.filter{
		margin:0 10px;
		.ivu-icon-chevron-left {
			font-size: 14px;
			vertical-align: middle;
			cursor: pointer;
		}
	}
	.menu-control {
		position: absolute;
		top: 40%;
		right: -12px;
		width: 12px;
		height: 60px;
		line-height: 60px;
		text-align: center;
		border-radius: 3px;
		background: #b5b5b5;
		color: #fff;
		cursor: pointer;
        transition: all .3s ease;
	}
	.list{
		li{
			cursor: pointer;
			display: block;  
			border-radius: 3px;
			>.ivu-icon{
				display:none;
			}
			&.active{
				background: #3091f2;color: #f8f8f9; 
				>.ivu-icon{
					display:block;
					line-height: inherit;
				}
			}
			&:hover{ 
				background: #3091f2;color: #f8f8f9; 
			}
		}
	}
}
</style>
<template>
	<div class="side-sub-nav" :style="{minHeight:maxHeight+'px'}">
		<div class="filter" v-if="total > 7">
			<Input class="filter-input" size="small" v-model="key" icon="search" placeholder="输入菜单名称过滤"></Input>
		</div>
		<ul class="p-2 list">
			<li :class="active_class(item.uri)" v-for="(item,index) in filterNavs" @click="change_uri(index,item.uri)">
				{{item.text}}
				<Icon class="pull-right" type="chevron-right"></Icon>				
			</li>
		</ul>
		<span class="menu-control" @click="collapsed">
			<Icon :type="is_collapsed?'chevron-right':'chevron-left'"></Icon>
		</span>
	</div>
</template>

<script>
	import util from '@/libs/util'
	export default{
		name:'Subnav',
		data () {
			return {
				key:'',
				is_collapsed: false,
				active_menu: 0
			}
		},
		props: {
			section: {
				type: String,
				default: ''
			}
		},
		mounted () {
			
		},
		methods: {
			collapsed() {
				this.is_collapsed = !this.is_collapsed
				this.$emit('collapsed',this.is_collapsed)
			},
			active_class(uri) {
				let path_uri = this.$route.path.replace(/\//g,'.')
				return (path_uri.indexOf(uri) !== -1?'m-lg-1 p-2 active':'m-lg-1 p-2')
			},
			change_uri(index,uri){
				let paths = [],uris = [],path
				if(this.section.indexOf('.') !== -1){
					paths = this.section.split('.')
				}else{
					paths.push(this.section)
				}
				uris = uri.split('.')
				for(let i=0,l=uris.length;i<l;i++){
					if(paths.indexOf(uris[i]) === -1){
						paths.push(uris[i])
					}
				}
				path = '/'+paths.join('/')
				this.active_menu = index
				this.$router.push({path:path})
			}
		},
		computed:{
			total(){
				return this.navs.length
			},
			filterNavs () {
				if(this.navs.length > 7 && !/^\s*$/.test(this.key)){
					return this.navs.filter(n=>n.text.indexOf(this.key) !== -1)
				}
				return this.navs
			},
			navs () {
				let navs = this.$store.state.user.info.navs.main
				let subnav = []
				let pos = this.section.indexOf('.')
				if(pos !== -1){
					let puri = this.section.substr(0,pos)
					navs = navs.find(m=>m.uri == puri).sub
				}
				if(typeof navs !== 'undefined' && typeof navs.find(m=>m.uri===this.section)){					
					subnav = navs.find(m=>m.uri===this.section).sub
				}
				return subnav
			},
			maxHeight() {
				let client = util.get_client_height()
				return client - 177
			}
		}
	}
</script>
