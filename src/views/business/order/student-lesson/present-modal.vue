<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
		<template v-if="modal$.show">
			<Form ref="form" :label-width="100" :modal="info">
				<Form-item label="学员：">
					<span>{{info.student.student_name}}</span>
				</Form-item>
				<Form-item label="课程/科目：">
					<span>{{info.lid|lesson_name}} ({{info.sj_ids|sj_ids_text}})</span>
				</Form-item>
				<Form-item label="赠送课时：">
					<InputNumber v-model="post.lesson_hours" :min="0"></InputNumber>
				</Form-item>
				<Form-item label="备注：">
					<Input type="textarea" v-model="post.remark"></Input>
				</Form-item>
			</Form>
			<div slot="footer">
				<Button type="ghost" @click="close">关闭</Button>
				<Button type="primary" @click="save">确定</Button>
			</div>
		</template>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	const post = {
		lesson_hours: 1,
		remark: ''
	}

	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				info: {
					student:{},
					lid:0,
					sj_ids:[]
				},
				post: util.copy(post)
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.post = util.copy(post)
				}
			}
		},
		methods: {
			save() {
				if(this.post.lesson_hours == 0) {
					this.$Message.error('赠送课时不能为0')
					return false
				}
				let param = Object.assign(util.copy(this.post),{
					sl_id:this.info.sl_id,
					op_type:1
				})
				this.$rest('student_lesson_operates')
				.post(param)
				.success(res => {
					this.$Message.success('赠送成功')
					this.$emit('save')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>