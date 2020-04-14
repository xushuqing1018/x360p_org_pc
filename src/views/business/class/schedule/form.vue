<template>
	<Form ref="form" :label-width="labelWidth" :model="data" :rules="rules">
		<Row>
    		<Col span="14">
		    	<FormItem label="课程" prop="lid">
		            <select-lesson v-model="data.lid" :condition="{lesson_type:[0]}" :allow-type="[0]" :clearable="true" @selected="selectLesson"></select-lesson>
		        </FormItem>
	        </Col>
	        <Col span="10">
	        	<FormItem label="科目" prop="sj_id">
		        	<Select v-model="data.sj_id" :disabled="!is_package">
        				<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
        			</Select>
    			</FormItem>
	        </Col>
        </Row>
        <Row>
        	<Col span="14">
        		<FormItem label="班级名" prop="class_name">
		            <Input v-model="data.class_name" placeholder="请输入"></Input>
		        </FormItem>
        	</Col>
        	<Col span="10">
        		<FormItem label="编号" prop="class_no">
		            <Input v-model="data.class_no" placeholder="请输入"></Input>
		        </FormItem>
        	</Col>
        </Row>

        <Row>
        	<Col span="8">
		        <FormItem label="教师" prop="teach_eid">
		        	<select-employee :rid="1" v-model="data.teach_eid" :clearable="true"></select-employee>
		      
		        </FormItem>
	        </Col>
	        <Col span="10">
        		<FormItem label="默认教室" prop="cr_id">
		            <select-class-room v-model="data.cr_id" @input="inputPlanStudentNums($event)"></select-class-room>
		        </FormItem>
	        </Col>
	        <Col span="6">
        		<FormItem label="预招人数" prop="plan_student_nums">
		            <InputNumber style="width:60px" :min="1" :max="1000" type="text" v-model="data.plan_student_nums"></InputNumber>
		        </FormItem>
        	</Col>
        </Row> 
       
        <Row>
        	<Col span="14">
        		<Form-item label="开课时段" prop="start_lesson_time">
                	<Date-picker 
                	type="date" 
                	placeholder="选择开课日期" 
                	format="yyyy-MM-dd" 
                	:value="data.start_lesson_time" 
                	@on-change="setLessonTime($event,'start')"
                	>
                	</Date-picker>
                </Form-item>		        
    		</Col>
    		<Col span="10">
    			<FormItem label="课次" prop="lesson_times">
    				<InputNumber tyle="width:80px" :min="1" :max="1000" type="text" v-model="data.lesson_times"></InputNumber>
		        </FormItem>
    		</Col>
    	</Row> 
	</Form>
</template>
<script>
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import SelectLesson from 'c%/SelectLesson.vue'
import SelectEmployee from 'c%/SelectEmployee'
import SelectClassRoom from 'c%/SelectClassRoom'
export default {
	name:'scheduleInfo',
	mixins:[common,globals],
	components:{
		SelectLesson,
		SelectEmployee,
		SelectClassRoom
	},
	props:{
		action:{
			type:String,
			default:'add',
			validator(value){
				return oneOf(value,['add','edit'])
			}	
		},
		labelWidth:{
			type:Number,
			default:80
		},
		data:{
			type:Object,
			default(){
				return {}
			}
		},
		rules:{
			type:Object,
			default(){
				return {}
			}
		}
	},
	methods:{
		reset () {
			this.$form('form').reset()
		},
		setLessonTime(date,field){
			field = field+'_lesson_time'
			this.$set(this.data,field,date)
			
		},
		inputPlanStudentNums(value){
			let room = this.getClassRoomObj(value)
			if(room){
				this.data.plan_student_nums = room.seat_nums
			}
		},
		check(){
			return this.$form('form').check()
		},
		selectLesson(selected) {
			this.$emit('on-select-lesson',selected)
		}
	},
	computed:{
		subjects(){
			let origin = this.$store.state.gvars.subjects
			if(this.data.lid > 0){
				let lesson = this.getLessonObj(this.data.lid)
				if(lesson && lesson.is_package == 1){
					return origin.filter(item=>lesson.sj_ids.indexOf(item.sj_id) > -1)
				}
			}
			return origin
		},
		is_package() {
			if(this.data.lid > 0) {
				let lesson = this.getLessonObj(this.data.lid)
				if(lesson && lesson.is_package == 1) {
					return true
				}else{
					return false
				}
			}else{
				return false
			}
		}
	}
}
</script>