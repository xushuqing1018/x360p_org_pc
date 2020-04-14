<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800">		
		<table class="modal-table">
    		<tr>
    			<td colspan="2">
    				<div class="ivu-table-cell">
    					<div class="padder-sm pull-left" style="width:137px;line-height: 26px;">已选项：</div>
    					<div class="pull-left">
    						<Tag class="mr-3" v-for="(item,index) in tag_id" :key="index">{{labelName(item)}}</Tag>
    					</div>
    				</div>
    			</td>
    		</tr>
    		<tr>
    			<td class="b-r-0" style="width:137px;">
    				<div class="ivu-table-cell">
    					<Checkbox @on-change="checkAll" v-model="checkboxAll">全选</Checkbox>    					
    				</div>
    			</td>
    			<td>
    				<div class="ivu-table-cell">
    					<CheckboxGroup v-model="tag_id">
    						<Checkbox v-for="(item,index) in group" :label="item.id" class="mr-3">{{item.name}}</Checkbox>	
    					</CheckboxGroup>				
    				</div>
    			</td>    			
    		</tr>
    	</table>
		
		<div slot="footer">
			<Button type="ghost" @click="close">
				关闭
			</Button>
			<Button type="primary" @click="ok" :loading="saving">
				确定
			</Button>			
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [ modal,common ],
		props: {
			group: {
				type: Array,
				default: ()=>{
					return []
				}
			}
		},
		data () {
			return {
				tag_id: [],
				fans_id: [],
				checkboxAll: false
			}
		},
		watch: {
			tag_id: function (val) {
				this.checkboxAll = (val.length == this.group.length)
			},
			'modal$.show': function (val) {
				if(val){
					if(this.modal$.action==='multiple'){
						this.tag_id = []
					}
				}
			}
		},
		methods: {
			labelName (id) {
				let group = this.group
				let obj = group.find(l=>l.id==id)
				if(obj) {
					return obj.name
				}
				return ''
			},
			checkAll () {
				let group = this.group
				this.tag_id = []
				
				if(this.checkboxAll){
					group.forEach(l=>{
						this.tag_id.push(l.id)
					})
				}
			},
			ok () {
				let params = {
					fans_id: this.fans_id,
					tag_id: this.tag_id
				},
				uri = (this.modal$.action=='multiple'?'wxmp_fans/tag_users':'wxmp_fans/update_fans_tag')
				
				if(params.tag_id.length===0){
					this.$Message.error('请选择标签')
					return
				}
				
							
				this.$rest(uri).post(params)
				.success(data=>{
					this.$Message.success('操作成功！')
					this.$emit('on-success')
					this.close()
				})
				
			}
		}
	}
	
</script>

<style>
</style>