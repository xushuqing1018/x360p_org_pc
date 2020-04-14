<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="450">
		<div>
			该计划【{{info.name}}】存在未考勤的排课记录
		</div>
		<div slot="footer">
			<Button type="primary" @click="deletePlan(0)">删除计划</Button>
			<Button type="primary" @click="deletePlan(1)">删除计划及未考勤排课</Button>
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	export default {
		mixins: [modal],
		props: {
			info: {
				type: Object,
				default:() => {
					return {}
				}
			}
		},
		data() {
			return {
				
			}
		},
		methods: {
			deletePlan(type) {
				this.$rest('class_schedule_mains')
				.delete(this.info.csm_id,{params:{delete_course: type}})
				.success(res => {
					this.$Message.success('删除成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>