<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="550">		
		<div class="ml-3">
			<Checkbox v-model="info.day0_push" :true-value="1" :false-value="0" class="mb-3">当日推送</Checkbox>
			<div class="ml-3" v-if="info.day0_push ==1">
				<label class="mr-2">当日推送时间</label>
				<TimePicker type="time" :value="info.day0_push_int_hour" format="HH:mm" @on-change="info.day0_push_int_hour=$event" confirm></TimePicker>
			</div>
			<div class="divide"></div>
			<Checkbox v-model="info.day1_push" :true-value="1" :false-value="0" class="d-block mb-3">提前1天推送</Checkbox>
			<Checkbox v-model="info.day2_push" :true-value="1" :false-value="0" class="d-block mb-3">提前2天推送</Checkbox>
			<Checkbox v-model="info.day3_push" :true-value="1" :false-value="0" class="d-block mb-3">提前3天推送</Checkbox>
			<div class="ml-3" v-if="info.day1_push ==1||info.day2_push ==1 || info.day3_push == 1">
				<label class="mr-2">提前推送时间</label>
				<TimePicker type="time" :value="info.dayn_push_int_hour" format="HH:mm" @on-change="info.dayn_push_int_hour=$event" confirm></TimePicker>
			</div>
		</div>
		<div slot="footer">
			<Checkbox class="pull-left ml-3" v-model="info.is_push_teacher" :true-value="1" :false-value="0" v-show="info.day0_push==1||info.day1_push ==1||info.day2_push ==1 || info.day3_push == 1">同时通知授课老师</Checkbox>
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
		day0_push: 0,
		day1_push: 0,
		day2_push: 0,
		day3_push: 0,
		day0_push_int_hour: '08:00',
		dayn_push_int_hour: '18:00',
		is_push_teacher: 0
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
				this.$rest('course_remind_plans')
				.add_url_param(0,'configs')
				.get()
				.success(res => {
					let info = util.copy(res)
					info.day0_push_int_hour = this.$filter('int_hour')(info.day0_push_int_hour)
					info.dayn_push_int_hour = this.$filter('int_hour')(info.dayn_push_int_hour)
					this.info = info
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			ok() {
				let advance = this.info.day1_push==0 &&
								this.info.day2_push==0 &&
									this.info.day3_push==0

				
				if(this.info.day0_push==1 && this.info.day0_push_int_hour==='') {
					this.$Message.error('请选择当日推送时间')
					return
				}
				if(this.info.dayn_push_int_hour==='' && !advance) {
					this.$Message.error('请选择提前推送时间')
					return
				}
				this.$rest('course_remind_plans')
				.add_url_param('0','configs')
				.post(this.info)
				.success(res => {
					this.$Message.success('课前提醒计划安排成功')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>
<style lang="less" scoped>
	.divide {
		border-bottom: 1px solid #e3e8ee;
		margin-bottom: 20px;
		margin-top: 20px;
	}
</style>