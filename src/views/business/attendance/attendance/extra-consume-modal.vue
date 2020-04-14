<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="课消项目" class="custom-form-item-required">
				<Select v-model="info.extra_consume_did">
					<Option :value="item.did" v-for="item in dicts('extra_consume')">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="消耗课时" class="custom-form-item-required">
				<InputNumber v-model="info.lesson_hours" :min="0"></InputNumber>
			</Form-item>
			<Form-item :label="label_teacher" class="custom-form-item-required">
				<select-employee v-model="info.teach_eid" :rid="1" clearable></select-employee>
			</Form-item>
			<Form-item label="备注">
				<Input v-model="info.remark"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消并关闭</Button>
			<Button type="primary" @click="ok">确认</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	const emptyObj = {
		extra_consume_did: 0,
		lesson_hours: 1,
		teach_eid: 0,
		remark: ''
	}

	export default{
		mixins: [modal,common],
		components: {
			SelectEmployee
		},
		props: {
			consumeLessonHour: {
				type: [Number,String],
				default: 0
			},
			remainLessonHours: {
				type: [Number,String],
				default: 0
			}
		},
		data() {
			return {
				teach_eid: 0,
				info: util.copy(emptyObj)
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val&&this.modal$.action=='add') {
					if(this.dicts('extra_consume').length>0) {
						this.info.extra_consume_did = this.dicts('extra_consume')[0].did
						this.info.teach_eid = this.teach_eid
					}
				}
			}
		},
		methods: {
			cancel() {
				this.$emit('on-cancel')
				this.close()
			},
			ok() {
				if(this.info.extra_consume_did == 0) {
					this.$Message.error('请选择课消项目')
					return
				}
				if(this.info.lesson_hours == 0) {
					this.$Message.error('请输入消耗课时')
					return
				}
				let diff = this.remainLessonHours - this.consumeLessonHour - this.info.lesson_hours
				if(diff < 0) {
					this.$Message.error('你输入的课时数超过剩余课时数')
					return
				}
				if(this.info.teach_eid == 0) {
					this.$Message.error(this.label_choose_teacher)
					return
				}
				this.$emit('on-success',this.info)
				this.close()
			}
		}
	}
</script>