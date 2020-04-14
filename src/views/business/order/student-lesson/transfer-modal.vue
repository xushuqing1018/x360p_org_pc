<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
		<template v-if="modal$.show">
			<Form ref="form" :label-width="100" :modal="info" class="row">
				<Form-item label="学员：" class="col-sm-12">
					<span>{{info.student.student_name}}</span>
				</Form-item>
				<Form-item label="课程/科目：" class="col-sm-12">
					<span>{{info.lid|lesson_name}} ({{info.sj_ids|sj_ids_text}})</span>
				</Form-item>
				<Form-item label="导入课时：" class="col-sm-12">
					<span>{{info.import_lesson_hours}}</span>
				</Form-item>
				<Form-item label="结转课时：" class="col-sm-6" v-help="'此处只能结转导入的课时，其他的请使用订单结转功能'">
					<InputNumber v-model="post.lesson_hours" :min="0" :max="max"></InputNumber>
				</Form-item>
				<Form-item label="课时单价：" class="col-sm-6">
					<Input v-keeptwo v-model="post.unit_price" style="width: 80px;"></Input>
				</Form-item>
				<Form-item label="备注：" class="col-sm-12">
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
		remark: '',
		unit_price: 0
	}

	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				post: util.copy(post),
				info: {
					student:{},
					lid: 0,
					sj_ids: [],
					import_lesson_hours: 0
				}
			}
		},
		computed: {
			max() {
				return parseFloat(this.info.import_lesson_hours) 
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
					this.$Message.error('结转课时不能为0')
					return false
				}
				let param = Object.assign(util.copy(this.post),{
					sl_id:this.info.sl_id,
					op_type:2
				})
				this.$rest('student_lesson_operates')
				.post(param)
				.success(res => {
					this.$Message.success('结转成功')
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