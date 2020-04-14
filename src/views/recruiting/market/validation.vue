<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="680" :mask-closable="false">		
		<div class="box box-query mb-3">
			<Button type="primary" @click="setValid(true)" :disabled="transferList.length==0">全部有效</Button>
			<Button type="primary" @click="setValid(false)" :disabled="transferList.length==0">全部无效</Button>
		</div>
		<div class="box box-result">
			<table class="x-modal-table modal-table">
				<thead>
					<th><div class="ivu-table-cell">转为客户</div></th>
					<th><div class="ivu-table-cell">姓名</div></th>
					<th><div class="ivu-table-cell">电话</div></th>
					<th><div class="ivu-table-cell">有效性</div></th>
				</thead>
				<tr v-for="item in list">
					<td>
						<div class="ivu-table-cell">
							<Checkbox :value="isTransfer(item)" readonly @click.native="toggleCheck(item)" v-if="item.cu_id==0"></Checkbox>
							<span v-else>-</span>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<span 
								:class="item.cu_id>0?'text-info':''" 
								:title="item.cu_id>0?'【'+item.name+'】已经转化为客户':''">
								{{item.name}}
							</span>			
						</div>
					</td>
					<td><div class="ivu-table-cell">{{item.tel}}</div></td>
					<td>
						<div class="ivu-table-cell">
							<Alert show-icon v-if="item.cu_id>0">{{item.name}}已经转化为客户</Alert>
							<RadioGroup v-model="item.is_valid" type="button" v-else>
								<Radio :label="1">有效</Radio>
								<Radio :label="2">无效</Radio>
							</RadioGroup>
						</div>
					</td>
				</tr>
			</table>
		</div>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving" v-if="transferList.length>0">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [ common,modal ],
		data () {
			return {
				info: {},
				list: []
			}
		},
		computed: {
			transferList () {
				let list = this.list,
					filter = (item)=>{
						return item.cu_id==0
					}
				
				return list.filter(filter)
			}
		},
		methods: {
			isTransfer (item) {			
				if(item.is_valid == 1){
					return item.$transfer||false
				}
				return false
			},
			toggleCheck (item) {
				if(item.$transfer){
					item.$transfer = false
				}else{
					this.$set(item,'$transfer',true)
				}
			},
			setValid (val) {
				this.list.forEach(item=>{
					if(item.cu_id==0){
						this.$set(item,'$transfer',val)
						item.is_valid = val?1:2
					}
				})
			},
			ok () {
				let params = this.setPost()
								
				this.$rest('market_clues/change_to_valid')
				.post(params)
				.success(data=>{
					this.$Message.success('操作成功！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
				
			},
			setPost () {
				let params = []
				this.list.forEach(item=>{
					let obj = {
						is_valid: item.is_valid,
						mcl_id: item.mcl_id,
						is_change: 0
					}
					if(item.is_valid==1&&item.$transfer&&item.cu_id>0){
						obj.is_change = 1						
					}
					if(item.cu_id==0){
						params.push(obj)						
					}
				})
				
				return params
			}
		}
	}
	
</script>

<style>
</style>