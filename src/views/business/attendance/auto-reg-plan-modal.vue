<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="550">		
		<div class="ml-3">
			<Checkbox v-model="info.enable" :true-value="1" :false-value="0" class="mb-3">启用自动考勤</Checkbox>
			<div class="ml-3" v-if="info.enable ==1">
				<label class="mr-2">每日考勤时间</label>
				<TimePicker type="time" :value="info.int_hour" format="HH:mm" @on-change="info.int_hour=$event" confirm></TimePicker>
				<Checkbox v-model="info.is_push" :true-value="1" :false-value="0" class="d-block mb-3">推送微信消息</Checkbox>
				<Checkbox v-model="info.leave_consume" :true-value="1" :false-value="0" class="d-block mb-3">请假也要扣课时</Checkbox>
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
		enable: 0,
		int_hour: '22:00',
		is_push: 0,
		leave_consume:1
	}

	export default{
		mixins: [modal,common],
		data () {
			return {				
				info: util.copy(emptyObject)
			}
		},
		mounted() {
			this.getPlans()
		},
		methods: {	
			getPlans() {
				this.$rest('auto_reg_attendances')
				.add_url_param(0,'configs')
				.get()
				.success(res => {
					let info = util.copy(res)
					this.info = info
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			ok() {
			
				if(this.info.enable==1 && this.info.int_hour==='') {
					this.$Message.error('请选择自动考勤时间')
					return
				}
				
				this.$rest('auto_reg_attendances')
				.add_url_param('0','configs')
				.post(this.info)
				.success(res => {
					this.$Message.success('自动考勤计划安排成功')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>