<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="650">
		<Form :label-width="80">
			<Form-item label="转让人" class="custom-form-item-required">
				<select-student 
					v-model="info.from_sid" 
					:disabled="student.sid>0" 
					@select="selectStudent"
					:clearable="false">
				</select-student>
			</Form-item>
			<Form-item label="转让课时" class="custom-form-item-required">
				<Select v-model="info.sl_id" @on-change="selectSL">
					<Option 
						v-for="item in studentLessons" 
						:value="item.sl_id"
						:disabled="item.remain_lesson_hours <= 0"
						>{{item.lid|lesson_name}} 
						<span>
							(剩余{{item.remain_lesson_hours}})
						</span>
					</Option>
				</Select>
			</Form-item>
			<Form-item label="接受人" class="custom-form-item-required">
				<select-student v-model="info.to_sid" clearable></select-student>
			</Form-item>
			<Form-item label="转出数量" class="custom-form-item-required">
				<InputNumber v-model="info.nums" :max="numsMax" :min="0"></InputNumber>
			</Form-item>
			<Form-item label="备注">
				<Input v-model="info.remark"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	const emptyObject = {
		from_sid: 0,
		to_sid: 0,
		sl_id: 0,
		nums: 0,
		remark:''
	}
	
	export default{
		mixins: [common,globals,modal],
		components: {
			SelectStudent
		},
		props: {
			student: {
				type: Object,
				default:()=>{
					return {}
				}
			}
		},
		data () {
			return {
				info: util. copy(emptyObject),
				currentSL: null,
				studentLessons: [],
				numsMax: Infinity
			}
		},
		methods: {
			onModalOpen() {
				if(this.student.sid > 0) {
					this.info.from_sid = this.student.sid
					this.getStudentLessons(this.student.sid)
				}
			},
			selectStudent(v) {
				this.getStudentLessons(v)
			},
			getStudentLessons(id) {
				this.$rest('student_lessons')
				.get({
					sid: id,
					with: 'student,one_class',
					pagesize: 20
				})
				.success(res => {
					this.studentLessons = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			selectSL(v) {
				this.currentSL = this.studentLessons.find(item => item.sl_id == v)
				this.numsMax = Number(this.currentSL.remain_lesson_hours)
			},
			ok () {
				if(this.info.sid == 0) {
					this.$Message.error('请选择转让人')
					return
				} 
				if(this.info.sl_id == 0) {
					this.$Message.error('请选择要转让的课程')
					return
				}
				if(this.info.to_sid == 0) {
					this.$Message.error('请选择接受人')
					return
				}else{
					if(this.info.from_sid == this.info.to_sid) {
						this.$Message.error('不能转给自己')
						return
					}
				}
				if(this.info.nums == 0) {
					this.$Message.error('转出数量不能为0')
					return
				}
				this.$rest('students').add_url_param(this.info.from_sid,'dotranshours')
				.post(this.info)
				.success(res => {
					this.$Message.success('转让成功')
					this.$emit('success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
	
</script>