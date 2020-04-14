<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="600">
		<Form :label-width="80">			
			<Form-item label="选择责任人">
				<select-employee v-model="info.eid" :rid="7" style="width: 300px;"></select-employee>
			</Form-item>
			<Form-item label="已选名单">
				<Tag v-for="item in follow_customers" :key="item.id">{{item.name}}</Tag>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<div class="pull-left">
				<span>已选择：
					<span class="text-info">{{follow_customers.length}}人</span>
				</span>
			</div>
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	export default{
		mixins: [ modal,common ],
		components: {
			SelectEmployee
		},
		data () {
			return {
				info: {
					eid:0,
					cu_ids: []
				}
			}
		},
		computed: {
			follow_customers() {
				return this.$store.state.follow_customers.list
			}
		},
		methods: {
			ok () {
				if(this.info.eid==0){
					this.$Message.error('请选择责任人')
					return
				}
				this.info.cu_ids = []
				this.follow_customers.forEach(c => {
					this.info.cu_ids.push(c.cu_id)
				})
				this.$rest('customers/assign_employee')
				.post(this.info)
				.success(data=>{
					this.$Message.success('分配成功！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
			}
		}
	}
</script>

<style>
</style>