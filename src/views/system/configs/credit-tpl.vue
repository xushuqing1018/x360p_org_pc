<template>
	<div>
		<Alert show-icon><p>菜单图标(格式:.jpg/png,尺寸:50px*50px,文件大小:<= 200KB)</p></Alert>
		<div>
			<table class="modal-table mt-2">
				<thead>
					<tr>
						<th width="20%"><div class="ivu-table-cell">标题</div></th>
						<th width="20%"><div class="ivu-table-cell">分值</div></th>
						<th width="20%"><div class="ivu-table-cell">图标</div></th>
						<th width="10%"><div class="ivu-table-cell">操作</div></th>
					</tr>
				</thead>
			</table>
		</div>
		<div class="service-cate" v-for="val in config">
			<Card dis-hover>
				<strong slot="title">{{val.title}}</strong>
				<table class="modal-table">
					<tbody>
						<tr v-for="(item,index) in val.items">
							<td width="20%">
								<div class="ivu-table-cell">
									<Input v-model="item.title"></Input>
								</div>
							</td>
							<td width="20%">
								<div class="ivu-table-cell">
									<InputNumber v-model="item.score" :min="val.type==1?1:-Infinity" :max="val.type==1?Infinity:-1"></InputNumber>
								</div>
							</td>
							<td width="20%">
								<div class="ivu-table-cell">
									<img :src="item.image" style="width: 50px;height: 50px;"/>
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
						<tr v-if="action == 'add'&&action_type==val.type">
							<td width="20%">
								<div class="ivu-table-cell">
									<Input v-model="new_item.title"></Input>
								</div>
							</td>
							<td width="20%">
								<div class="ivu-table-cell">
									<InputNumber v-model="new_item.score" :min="val.type==1?1:-Infinity" :max="val.type==1?Infinity:-1"></InputNumber>
								</div>
							</td>
							<td width="20%">
								<div class="ivu-table-cell">
									<img :src="new_item.image" style="width: 50px;height: 50px;" v-if="new_item.image"/>
									<Button 
										type="ghost" 
										icon="ios-clock-outline" 
										@click="selectFromMyFile(new_item)" 
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
										icon="checkmark" 
										@click="addOk(val.type)">
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
										@click="addItem(val.type)">添加
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
	const emptyItem = {
		title: '',
		score: 0,
		image: ''
	}
	export default{
		mixins:[common,config,globals],
		data() {
			return {
				cfg_name:'org_credit_op_tpl',
				config: {
					
				},
				new_item: util.copy(emptyItem),
				action: '',
				action_type: ''
			}
		},
		methods: {
			delItem(val,index) {
				val.items.splice(index,1)
			},
			addItem(type) {
				this.action = 'add'
				this.action_type  = type
				this.new_item = util.copy(emptyItem)
				if(type==1) {
					this.new_item.score = 1
				}else{
					this.new_item.score = -1
				}
			},
			addOk(type) {
				if(this.new_item.title === '' || this.new_item.image === '' || this.new_item.score === '') return;
				this.config.find(c => c.type==type).items.push(util.copy(this.new_item))
				this.resetNewItem()
			},
			addCancel() {
				this.resetNewItem()
			},
			resetNewItem() {
				this.new_item = util.copy(emptyItem)
				this.action = ''
				this.action_type = ''
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
			}
		}
	}
</script>