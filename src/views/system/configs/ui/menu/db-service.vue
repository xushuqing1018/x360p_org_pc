<template>
	<div>
		<Alert show-icon><p>菜单图标(格式:.jpg/png,尺寸:50px*50px,文件大小:<= 200KB)</p></Alert>
		<table class="modal-table mt-2">
			<thead>
				<tr>
					<th width="20%"><div class="ivu-table-cell">标题</div></th>
					<th width="20%"><div class="ivu-table-cell">链接</div></th>
					<th width="20%"><div class="ivu-table-cell">图标</div></th>
					<th width="10%"><div class="ivu-table-cell">操作</div></th>
				</tr>
			</thead>
		</table>
		<div class="service-cate" v-for="(val,key) in config">
			<Card dis-hover>
				<strong slot="title">{{val.text}}</strong>
				<table class="modal-table">
					<tbody>
						<tr v-for="(item,index) in val.items">
							<td width="20%">
								<div class="ivu-table-cell">
									<Input v-model="item.text"></Input>
								</div>
							</td>
							<td width="20%">
								<div class="ivu-table-cell">
									<Input v-model="item.uri"></Input>
								</div>
							</td>
							<td width="20%">
								<div class="ivu-table-cell">
									<img :src="item.icon" style="width: 50px;height: 50px;"/>
									<Button 
										type="ghost" 
										icon="ios-clock-outline" 
										@click="selectFromMyFile(item)" 
										class="ml-2">上传图标
									</Button>
								</div>
							</td>
							<td width="10%">
								<div class="ivu-table-cell">
									<Button 
										type="ghost" 
										size="small" 
										shape="circle" 
										icon="ios-trash"
										@click="delItem(val,index)">
									</Button>
								</div>
							</td>
						</tr>
					</tbody>
					<tfoot>
						<tr v-if="action == 'add'&&action_key==key">
							<td width="20%">
								<div class="ivu-table-cell">
									<Input v-model="new_item.text"></Input>
								</div>
							</td>
							<td width="20%">
								<div class="ivu-table-cell">
									<Input v-model="new_item.uri"></Input>
								</div>
							</td>
							<td width="20%">
								<div class="ivu-table-cell">
									<img :src="new_item.icon" style="width: 50px;height: 50px;" v-if="new_item.icon"/>
									<c-upload v-model="item.icon" btn-text="设置图标"></c-upload>
								</div>
							</td>
							<td width="10%">
								<div class="ivu-table-cell">
									<Button 
										type="ghost" 
										size="small" 
										shape="circle" 
										icon="checkmark" 
										@click="addOk(key)">
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
						<tr v-else>
							<td colspan="4" class="text-center">
								<div class="ivu-table-cell">
									<Button 
										type="text" 
										size="small" 
										icon="plus" 
										@click="addItem(key)">添加
									</Button>
								</div>
							</td>
						</tr>
					</tfoot>
				</table>
			</Card>
		</div>
		<div class="mt-4">
			<Button type="primary" @click="handleSubmit">保存</Button>
			<Button type="ghost" @click="restoreDefault" class="ml-2" :disabled="cfg_id==0">恢复默认设置</Button>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import config from '@/libs/config.mixin'
	import globals from '@/libs/globals.mixin'
	import cUpload from 'c%/cUpload.vue';
	const emptyItem = {
		text: '',
		uri: '',
		icon: '',
		is_system: 0,
		name: ''
	}
	export default{
		mixins:[common,config,globals],
		components:{
			cUpload
		},
		data() {
			return {
				cfg_name:'org_service_dashboard',
				config: {
					
				},
				new_item: util.copy(emptyItem),
				action: '',
				action_key: ''
			}
		},
		methods: {
			delItem(val,index) {
				val.items.splice(index,1)
			},
			addItem(key) {
				this.action = 'add'
				this.action_key  = key
			},
			addOk(key) {
				if(this.new_item.text === '' || this.new_item.icon === '' || this.new_item.uri === '') return;
				this.new_item.name = 'p' + (this.config[key].items.length + 1)
				this.config[key].items.push(util.copy(this.new_item))
				this.resetNewItem()
			},
			addCancel() {
				this.resetNewItem()
			},
			resetNewItem() {
				this.new_item = util.copy(emptyItem)
				this.action = ''
				this.action_key = ''
			}
		}
	}
</script>
<style lang="less">
	.service-cate {
		margin-top: 15px;
		table tr {
			background-color: #fff !important; 
		}
		strong {
			margin-top: 15px;
			font-size: 14px;
		}
		.ivu-card-body {
			padding: 0;
		}
		tfoot td {
			border: 0 !important;
		}
	}
</style>