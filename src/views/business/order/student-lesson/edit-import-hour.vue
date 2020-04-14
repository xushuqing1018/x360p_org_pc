<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form ref="ref_search" :model="info" :label-width="80">
			<Form-item label="导入课时数" prop="lesson_hours" class="col-sm-4">
				<InputNumber v-model="info.lesson_hours" :min="0"></InputNumber>
			</Form-item>
            <Form-item label="课时单价" prop="unit_lesson_hour_amount" class="col-sm-4">
				<InputNumber v-model="info.unit_lesson_hour_amount" :min="0"></InputNumber>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'

	export default {
		mixins:[globals,common,modal],
		data() {
			return {
				info: {}
			}
		},
		methods: {
			ok() {
				this.$rest('student_lesson_import_logs').add_url_param(this.info.slil_id)
				.put(this.info)
				.success(res => {
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