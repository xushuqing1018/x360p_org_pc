<style lang="less" scoped>
	.role-config-wrapper {
		.active-tag.ivu-tag-dot {
			border: 1px solid #39f !important;
		}
	}
</style>
<template>
	<div>
		<div class="role-config-wrapper mb-2">
			<Tag 
				:class="{'active-tag':current_rid==item.rid}"
				type="dot" 
				:color="current_rid==item.rid?'blue':'default'" 
				:closable="item.rid>0" 
				@on-close="delQuickMenuItem(index)"
				v-for="(item,index) in config.quick_menu"
				@click.native="changeRole(item)">
				<span>{{item.rid|role_name('默认')}}</span>
			</Tag>
			<Select v-model="add_rid" @on-change="selectRole" v-if="action_role=='add'" style="width: 10%;">
				<Option :value="item.rid" v-for="item in roles" :disabled="disabeld_rid(item)">{{item.role_name}}</Option>
			</Select>
			<Button type="text" size="small" icon="plus" title="添加" @click="addRole"></Button>
		</div>
		<Alert show-icon><p>菜单图标(格式:.jpg/png,尺寸:50px*50px,文件大小:<= 200KB)</p></Alert>
		<div class="role-funcs">
			<table class="modal-table mt-2" v-for="menu in config.quick_menu" v-if="menu.rid == current_rid">
				<thead>
					<tr>
						<th><div class="ivu-table-cell">标题</div></th>
						<th><div class="ivu-table-cell">链接</div></th>
						<th><div class="ivu-table-cell">图标</div></th>
						<th><div class="ivu-table-cell">操作</div></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in menu.items">
						<td>
							<div class="ivu-table-cell">
								<Input v-model="item.text"></Input>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Input v-model="item.uri" :readonly="item.is_system==1"></Input>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<img :src="item.icon" style="width: 50px;height: 50px;"/>
								<c-upload v-model="item.icon" btn-text="设置图标"></c-upload>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Button 
									type="ghost" 
									size="small" 
									shape="circle" 
									icon="ios-trash"
									@click="delItem(menu,index)">
								</Button>
							</div>
						</td>
					</tr>
				</tbody>
				<tfoot>
					<tr v-if="action_item == 'add'">
						<td>
							<div class="ivu-table-cell">
								<Input v-model="new_item.text"></Input>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Input v-model="new_item.uri"></Input>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<img :src="new_item.icon" style="width: 50px;height: 50px;" v-if="new_item.icon"/>
								<Button 
									type="ghost" 
									icon="ios-clock-outline" 
									@click="selectFromMyFile(new_item)" 
									class="ml-2">上传图标
								</Button>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Button 
									type="ghost" 
									size="small" 
									shape="circle" 
									icon="checkmark" 
									@click="addOk(menu)">
								</Button>
								<Button 
									type="ghost" 
									size="small" 
									shape="circle" 
									icon="close" 
									@click="addCancel">
								</Button>
							</div>
						</td>
					</tr>
					<tr v-if="action_item == ''&&menu.items.length < 12">
						<td colspan="4" class="text-center">
							<div class="ivu-table-cell">
								<Button 
									type="text" 
									size="small" 
									icon="plus" 
									@click="addItem">添加
								</Button>
							</div>
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
		<div class="mt-4">
			<Button type="primary" @click="ok">保存</Button>
			<Button type="ghost" @click="restoreDefault" class="ml-2" :disabled="cfg_id==0">恢复默认设置</Button>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import config from '@/libs/config.mixin'
	import globals from '@/libs/globals.mixin'
	import XTree from 'c%/XTree.vue' 
	import cUpload from 'c%/cUpload.vue';
	export default{
		mixins:[common,config,globals],
		components: {
			XTree,
			cUpload
		},
		data() {
			return {
				cfg_name:'org_pc_ui',
				config: {
					quick_menu:[

					]
				},
				current_rid: 0,
				new_item: {
					text: '',
					uri: '',
					icon: '',
					is_system: 0,
					name: ''
				},
				action_item: '',
				action_role: '',
				add_rid: 0
			}
		},
		computed: {
			roles() {
				return this.$store.state.gvars.roles
			}
		},
		methods: {
			disabeld_rid(item) {
				return !!this.config.quick_menu.find(m => m.rid == item.rid)
			},
			delQuickMenuItem(index) {
				this.config.quick_menu.splice(index,1)
				this.current_rid = 0
			},
			addRole() {
				if(this.action_role == 'add') return;
				this.action_role = 'add'
			},
			changeRole(item) {
				this.current_rid = item.rid
				this.resetNewItem()
			},
			selectRole(value) {
				this.current_rid = value
				this.config.quick_menu.push({
					rid: value,
					name: '',
					items: []
				})
				this.action_role = ''
				this.add_rid = 0
			},
			delItem(menu,index) {
				menu.items.splice(index,1)
			},
			addItem() {
				this.action_item = 'add'
			},
			addOk(menu) {
				if(this.new_item.text === '' || this.new_item.icon === '' || this.new_item.uri === '') return;
				this.new_item.name = 'p' + (menu.items.length + 1)
				menu.items.push(util.copy(this.new_item))
				this.resetNewItem()
			},
			addCancel() {
				this.resetNewItem()
			},
			resetNewItem() {
				this.new_item.text = ''
				this.new_item.icon = ''
				this.new_item.uri = ''
				this.new_item.name = ''
				this.action_item = ''
			},
			initFinished() {
				if(this.config.quick_menu.length) {
					this.current_rid = this.config.quick_menu[0].rid
				}
			},
			selectFromMyFile(item) {
				this.$Modal.open('components/SelectFile.vue@modal',{
					props: {
						selType: 'image',
						'hide-upload-bylocal': false
					},
					on: {
						'selected':(data)=>{
							item.icon = data.file_url
						}
					}
				})
				.then(modal => {
					modal.vuec.show('选择图标','list')
				})
			},
			ok() {
				this.config.quick_menu = this.config.quick_menu.filter(item => item.items.length > 0)
				this.handleSubmit()
			}
		}
	}
</script>