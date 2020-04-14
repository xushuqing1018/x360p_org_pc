<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="600" :mask-closable="false">
		<Form :label-width="80">
			<FormItem label="有效期">
				<DatePicker 
					type="date" 
					:value="info.expire_time?info.expire_time:''" 
					@on-change="info.expire_time=$event" 
					format="yyyy-MM-dd" 
					placeholder="无限制" 
					style="width: 200px">
				</DatePicker>
			</FormItem>
			<FormItem label="可用科目">
				<Select v-model="info.sj_ids" multiple>
					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
				</Select>
			</FormItem>
			<FormItem label="可用班级">
				<select-class v-model="info.cid" clearable></select-class>
			</FormItem>
			<FormItem label="可用课程">
				<select-lesson v-model="info.lid" clearable @selected="lessonSelected"></select-lesson>
			</FormItem>
			<Form-item label="课时状态" v-if="lessonEnd">
				<Select v-model="info.lesson_status">
					<Option :value="0">正常</Option>
					<Option :value="2">结课</Option>
				</Select>
			</Form-item>
			<Form-item prop="is_online" label="线上课" v-if="enable_online_lesson">
                <i-switch v-model="info.is_online" :true-value="1" :false-value="0"></i-switch>
            </Form-item>
			<FormItem label="教师星级" v-if="enable_teacher_level">
				<Select v-model="info.teacher_level" :clearable="true" style="width: 300px">
                    <Option v-for="(item,index) in teacher_levels" :value="index">{{item.name}}</Option>
                </Select>
			</FormItem>
			<Form-item prop="leave_nums_limit" label="允许请假">
				<InputNumber v-model="info.leave_nums_limit" :min="-2"></InputNumber>
				<span>次（-1为全局限制，0为不限制，-2为不允许请假）</span>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	import SelectClass from 'c%/SelectClass.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	
	const emptyObject = {
		expire_time: '',
		sj_ids: [],
		cid: 0,
		lid: 0,
		teacher_level:-1,
		leave_nums_limit:-1
	}
	
	export default{
		mixins: [ common,modal ],
		components: {
			SelectClass,
			SelectLesson
		},		
		data () {
			return {
				sl_id: 0,
				lessonEnd: false,
				info: util.copy(emptyObject)
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			}
		},
		methods: {
			lessonSelected(lesson) {
				this.info.lesson_type = lesson.lesson_type
				this.info.is_package = lesson.is_package
			},
			ok () {				
				if(
					this.info.sj_ids.length==0
					&& this.info.cid==0
					&& this.info.lid==0
				){
					this.$Message.error('适用科目/班级/课程至少选择一个！')
					return false
				}
				
				this.$rest('student_lessons/'+this.sl_id).put(this.info)
				.success(data=>{
					this.$Message.success('修改成功！')
					this.$emit('on-success')
					this.close()					
				}).error(response=>{
					this.error(response.body.message||'修改失败！')
				})
			}
		}
	}
	
</script>

<style>
</style>