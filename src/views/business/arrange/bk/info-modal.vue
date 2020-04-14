<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="600">
		<Form :label-width="100">
			<Form-item :label="'上课'+label_teacher" prop="teach_eid" class="ivu-form-item-required">
				<select-employee v-model="info.teach_eid" style="width: 200px"></select-employee>
			</Form-item>
			<Form-item label="扣课时数" prop="consume_lesson_hour" class="ivu-form-item-required">
				<InputNumber v-model="info.consume_lesson_hour" :min="0"></InputNumber>
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
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	export default {
		mixins: [modal,common,globals],
		components: {
			SelectEmployee
		},
		data() {
			return {
				info: {
					teach_eid: 0,
					consume_lesson_hour: 0
				},
				cas_id: 0
			}
		},
		methods: {
			ok() {
				if(this.info.teach_eid==0) {
					this.$Message.error(this.label_teacher+'不能为空')
					return
				}
				this.$rest('course_arrange_students').add_url_param(this.cas_id)
				.put(this.info)
				.success(res => {
					this.$Message.success('编辑成功')
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