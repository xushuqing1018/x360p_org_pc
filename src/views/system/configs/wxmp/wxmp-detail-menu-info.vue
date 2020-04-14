<template>
	<div class="menu-content-container box" style="width:944px;">
		<div>
			<a @click="backList"><Icon type="reply"></Icon>返回菜单列表</a>
		</div>
		<div class="row m-t m-b">
			<div class="col-sm-6">				
				<label style="width:100px;">菜单组名称</label>
				<Input v-model="menu.group_name" placeholder="菜单组名称..." style="width:280px"></Input>		
			</div>
			<div class="col-sm-6">
				<label style="width:100px;">显示对象</label>
				<Select 
					:value="menu.matchrule?menu.matchrule.group_id:0" 
					@on-change="tagChange" 
					style="display: inline-block;width: 280px">
					<Option :value="0">所有粉丝</Option>
					<Option :value="String(item.id)" v-for="(item,index) in groups" :key="index">{{item.name}}</Option>
				</Select>
			</div>
		</div>
		<wxmp-detail-menu-info-buttons
		:group-name="menu.group_name"
		:buttons="menu.buttons"
		:button-index="index"
		:sub-button-index="childIndex"
		@on-menu-button-add="addMenuButton"
		@on-menu-subbutton-add="addMenuSubButton"
		@on-menu-button-edit="editMenuButton"
		>
		</wxmp-detail-menu-info-buttons>
		<wxmp-detail-menu-info-button
		:button="menu_button"
		:button-index="index"
		:sub-button-index="childIndex"
		@on-menu-button-delete="deleteMenuButton"
		>
		</wxmp-detail-menu-info-button>
		<div class="pd-10 m-t clear text-center">
			<Button type="primary" @click="save">保存并关闭</Button>
			<Button type="ghost" @click="preview">预览</Button>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
		
	import wxmpDetailMenuInfoButtons from './wxmp-detail-menu-info-buttons.vue'
	import wxmpDetailMenuInfoButton from './wxmp-detail-menu-info-button.vue'

	export default{
		mixins: [common],
		components: {
			wxmpDetailMenuInfoButtons,
			wxmpDetailMenuInfoButton
		},
		props: {
			menu:{
				type: Object,
				default:()=>{
					return null
				}
			},
			groups:{
				type:Array,
				default:()=>{
					return []
				}
			}
		},
		data () {
			return {
				index:-1,
				childIndex:-1,
				menu_button:{}
			}
		},
		watch: {
			
		},
		mounted () {
			
		},
		methods: {
			addMenuButton(){
				if(this.menu.buttons.length > 2){
					return;
				}
				this.menu.buttons.push({
					type:'view',
					name:'菜单名称',
					url:'',
					sub_button:[]
				})
				this.editMenuButton({buttonIndex:this.menu.buttons.length-1,subButtonIndex:-1})
			},
			addMenuSubButton(index){
				if(!this.menu.buttons[index].sub_button){
					this.menu.buttons[index].sub_button = []
				}
				if(this.menu.buttons[index].sub_button.length > 4){
					return
				}
				this.menu.buttons[index].sub_button.push({
					type: 'view',
					name: '子菜单名称',
					url:'',
					media_id: '',
					key:'',
					appid:'',
					pagepath:''
				})
				this.editMenuButton({buttonIndex:index,subButtonIndex:this.menu.buttons[index].sub_button.length - 1})
			},
			editMenuButton({buttonIndex,subButtonIndex}){
				if(subButtonIndex == -1){
					this.menu_button = this.menu.buttons[buttonIndex]
				}else{
					this.menu_button = this.menu.buttons[buttonIndex].sub_button[subButtonIndex]
				}
				this.index = buttonIndex
				this.childIndex = subButtonIndex
			},
			deleteMenuButton(){
				let btn = this.menu.buttons[this.index]
				if(this.childIndex > -1){
					btn = btn.sub_button[this.childIndex]
				}
				this.confirm('确认删除"'+btn.name+'"吗，删除后菜单下设置的内容将被删除')
				.then(()=>{
					this.doDeleteMenuButton()
				})	
			},
			doDeleteMenuButton(){
				if(this.childIndex == -1){
					this.menu.buttons.splice(this.index,1)
				}else{
					this.menu.buttons[this.index].sub_button.splice(this.childIndex,1)
				}
				this.index = -1
				this.childIndex = -1 
			},
			backList(){
				this.$emit('on-back-list')
			},
			save(){
				if(this.menu.wm_id > 0){
					this.$rest('wxmp_menus')
					.add_url_param(this.menu.wm_id)
					.put(this.menu)
					.success(response=>{
						this.$Message.success('菜单编辑成功!')
						this.$emit('on-save-success')
						this.backList()
					})
					.error(response=>{
						this.$Notice.error({
							title: '错误',
							desc: response.message||'添加自定义菜单错误'
						})
					})
				}else{
					this.$rest('wxmp_menus')
					.post(this.menu)
					.success(response=>{
						this.$Message.success('菜单编添加成功!')
						this.$emit('on-save-success')
						this.backList()
					})
					.error(response=>{
						this.$Notice.error({
							title: '错误',
							desc: response.message||'添加自定义菜单错误'
						})
					})
				}
			},
			preview(){
				this.$emit('on-menu-preview')
			},
			tagChange (val) {
				if(!this.menu.matchrule){
					this.menu.matchrule = {}
				}
				this.$set(this.menu.matchrule,'group_id',val)
			},
		}
	}
</script>
</script>