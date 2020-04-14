<template>
	<div>
		<div class="box box-query">
			<Button type="primary" class="ml-3" icon="plus" @click="addMenu">新增</Button>		      
			<Button type="primary" class="ml-3" icon="ios-download-outline" @click="sycnMenu">同步微信菜单</Button>	
		</div>
		<div class="box box-result m-t">
			<div class="content">
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">菜单组名</div></th>
						<th><div class="ivu-table-cell">显示对象</div></th>
						<th><div class="ivu-table-cell">是否在微信生效<span class="text-desc">（只能生效一个默认菜单）</span></div></th>
						<th><div class="ivu-table-cell">操作</div></th>
					</thead>
					<tr v-for="(item,index) in menus" :key="index">
						<td><div class="ivu-table-cell">{{item.group_name}}</div></td>
						<td><div class="ivu-table-cell">{{getGroupName(item.matchrule)}}</div></td>
						<td>
							<div class="ivu-table-cell">
								<span class="text-success" v-if="item.status==1">菜单生效中</span>
								<a class="text-info" @click="activeMenu(item)" v-else>生效并置顶</a>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<a class="text-info mr-3" @click="editMenu(item)">编辑</a>
								<a class="text-info" @click="deleteMenu(item)">删除</a>		        						
							</div>
						</td>
					</tr>
					<tr v-if="loading||menus.length == 0">
						<td colspan="4">
							<div class="ivu-table-cell text-center al-c" v-if="loading">正在加载菜单...</div>
							<template v-else>
								<div class="ivu-table-cell text-center al-c" v-if="menus.length == 0">还没有自定义菜单</div>
							</template>
						</td>
					</tr>
				</table>
	        </div>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins:[common],
		props:{
			menus: {
				type: Array,
				default(){
					return []
				}
			},
			groups:{
				type:Array,
				default(){
					return []
				}
			},
			loading:{
				type:Boolean,
				default:false
			}
		},
		
		data () {
			return {
				
			}
		},
		mounted () {			
			
		},
		methods:{
			sycnMenu(){
				this.$emit('on-sync-menu')
			},
			addMenu(){
				this.$emit('on-add-menu')
			},
			editMenu(item){
				this.$emit('on-edit-menu',item)
			},
			activeMenu(item){
				this.$emit('on-active-menu',item)
			},
			deleteMenu(item){
				this.$emit('on-delete-menu',item)
			},
			exitView(){
				this.$emit('on-exit-view')
			},
			getGroupName (matchrule){
				let result = '所有粉丝'
				let groups = this.groups
				if(matchrule&&matchrule.group_id){
					let obj = groups.find(g=>g.id==matchrule.group_id)
					if(obj){
						result = obj.name						
					}
				}
				return result
			}
		}
	}
</script>