<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form :label-width="100">
			<Form-item label="上课老师" prop="info">
				<select-employee v-model="eid" :rid="1" clearable style="width: 250px"></select-employee>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	export default {
		mixins:[modal,common],
		props: {
			info: Object
		},
		components: {
			SelectEmployee
		},
		data() {
			return {
				eid: 0
			}
		},
		methods: {
			onModalOpen() {
				if(this.info.eid) {
					this.eid = this.info.eid
				}
			},
			ok() {
				if(this.eid==0) {
					this.$Message.error('请选择上课老师')
					return
				}
				this.$rest('student_lessons').add_url_param(this.info.sl_id,'doemployee')
				.post({
					eid: this.eid
				})
				.success(res => {
					this.$Message.success('安排成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(re.body.message)
				})
			}
		}
	}
</script>