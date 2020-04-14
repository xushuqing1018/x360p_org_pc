<template>
	<div>
		<wxmp-detail-menu-list
		:menus="menus"
		:groups="groups"
		:loading="loading"
		@on-exit-view="exitView"
		@on-add-menu="addMenu"
		@on-edit-menu="editMenu"
		@on-active-menu="activeMenu"
		@on-delete-menu="deleteMenu"
		@on-sync-menu="syncMenu"
		v-if="action == 'list'"
		>
		</wxmp-detail-menu-list>
		<wxmp-detail-menu-info
		:menu="menu"
		@on-back-list="backList"
		@on-save-success="menuSaveSuccess"
		@on-menu-preview="previewMenu"
		v-if="action == 'edit'"
		>
		</wxmp-detail-menu-info>
		
		<!--预览-->
		<wxmp-detail-menu-preview
		:menu="menu"
		@on-exit-view="exitView"
		v-if="preview"
		>
		</wxmp-detail-menu-preview>
	</div>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import directive from '@/libs/directive.mixin'
	
	
	import wxmpDetailMenuList from './wxmp-detail-menu-list.vue'
	import wxmpDetailMenuInfo from './wxmp-detail-menu-info.vue'
	import wxmpDetailMenuPreview from './wxmp-detail-menu-preview.vue'
	
	const emptyMenu = {
		group_name: '默认菜单',
		matchrule: null,
		wxmp_id: 0,
		appid:'',
		wm_id:0,
		menuid:0,
		status:1,
		buttons: [{
			name: '菜单名称1'	,
			type:'view',
			url:'',
			sub_button:[]	
		},{
			name:'菜单名称2',
			type:'view',
			url:'',
			sub_button:[]
		},{
			name:'菜单名称3',
			type:'view',
			url:'',
			sub_button:[]
		}]
	}
	
	export default{
		mixins: [directive,common],
		components:{
			wxmpDetailMenuList,
			wxmpDetailMenuInfo,
			wxmpDetailMenuPreview
		},
		props: {
			mpinfo:{
				type: Object,
				default:()=>{
					return null
				}
			}
		},
		data () {
			return {
				loading:false,
				action: 'list',
				preview:false,
				menu: util.copy(emptyMenu),
				menus: [],
				groups:[]
			}
		},
		watch: {
			
		},
		mounted () {
			this.init_data()
			this.init_group()
		},
		methods: {
			init_data(){
				this.loading=true
				this.$rest('wxmp_menus')
				.get({
					wxmp_id:this.mpinfo.wxmp_id,
					page:1,
					pagesize:20
				})
				.success(response=>{
					this.loading=false
					this.menus = response.list
				})
				.error(response=>{
					this.loading = false
				})
			},
			init_group () {
				this.$rest('wxmp_tags')
				.get()
				.success(response=>{
					this.groups = response.tags
				})
			},
			backList(){
				this.action = 'list'
			},
			exitView(){
				this.preview = false
			},
			addMenu(){
				this.menu = util.copy(emptyMenu)
				this.menu.appid = this.mpinfo.authorizer_appid
				this.menu.wxmp_id = this.mpinfo.wxmp_id
				this.action = 'edit'
			},
			editMenu(item){
				this.menu = util.copy(item)
				this.action = 'edit'
			},
			deleteMenu(item){
				this.confirm('确认删除菜单组名为"'+item.group_name+'"的菜单吗?')
				.then(()=>{
					this.doDeleteMenu(item)
				})	
			},
			doDeleteMenu(item){
				this.$rest('wxmp_menus')
				.delete(item.wm_id)
				.success(response=>{
					this.$Message.success('菜单已删除!')
					this.init_data()
				})
				.error(response=>{
					this.error(response.body.message)
				})
			},
			activeMenu(item){
				this.$rest('wxmp_menus')
				.add_url_param(item.wm_id,'doactive')
				.post()
				.success(response=>{
					this.$Message.success('启用成功')
					this.init_data()
				})
				.error(response=>{
					this.$Notice.error({
						title: '错误',
						desc: response.message||'启用失败'
					})
				})
			},
			syncMenu(){
				this.showPageSpin()
				this.$http.get('wxmp_menus/sync?appid='+this.mpinfo.authorizer_appid)
				.then(response=>{
					this.init_data()
					this.hidePageSpin()
				},response=>{
					this.hidePageSpin()
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'同步微信出错~'
					})
				})
			},
			menuSaveSuccess(){
				this.init_data()
			},
			previewMenu () {
				setTimeout(()=>{
					this.preview = true
				},1000)
				
			}
		}
	}
</script>
