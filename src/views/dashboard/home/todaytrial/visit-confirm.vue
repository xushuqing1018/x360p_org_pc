<template>
	<Modal v-model="modal$.show" :title="modal$.title" width="450px" :mask-closable="false">
		<Form :label-width="120">
			<Form-item label="选择到访日期">
				<DatePicker v-model="visit_int_day" type="date" placeholder="选择日期" style="width: 200px"></DatePicker>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="cancel">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		data() {
			return {
				visit_int_day: '',
				item: {}
			}
		},
		methods: {
			ok () {
				if(this.visit_int_day==''){
					this.$Message.error('请选择到访日期')
					return false
				}
				this.confirm_visit()
			},
			cancel () {
				this.visit_int_day = ''
				this.close()
			},
			confirm_visit () {
				let [params,item] = [{},this.item]
				params.is_visit = item.is_visit===1?0:1
				if(params.is_visit==1){
					params.visit_int_day = this.visit_int_day	
				}				
				
				this.$rest('customer_follow_up/'+item.cfu_id).put(params)
				.success(data=>{
					this.$Message.success('操作成功')
					this.$emit('on-success')
					this.cancel()
				}).error(response=>{
					this.error(response.body.message||'操作失败')
				})
			}
		}
	}
</script>