<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="550">		
		<div class="ml-3">
			<Checkbox v-model="info.enable" :true-value="1" :false-value="0" class="mb-3">开启每日推送提醒</Checkbox>
			<div class="ml-3">
				<label class="mr-2">每日推送时间</label>
				<TimePicker type="time" :value="info.int_hour" format="HH:mm" @on-change="info.int_hour=$event" confirm></TimePicker>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	const emptyObject = {
        name:'regular_service',
		enable: 0,
		int_hour: '07:00'
	}

	export default{
		mixins: [modal,common],
		data () {
			return {				
				info: util.copy(emptyObject)
			}
		},
		mounted() {
			this.getRemindPlans()
		},
		methods: {	
			getRemindPlans() {
				this.$rest('system_task_configs')
				.get({name:'regular_service'})
				.success(res => {
					let info = util.copy(res)
					info.int_hour = this.$filter('int_hour')(info.int_hour)
					this.info = info
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			ok() {
				
				
				if(this.info.enable==1 && this.info.int_hour==='') {
					this.$Message.error('请选择每日推送时间')
					return
				}
				
				this.$rest('system_task_configs')
				.post(this.info)
				.success(res => {
					this.$Message.success('自动提醒计划设置成功')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>