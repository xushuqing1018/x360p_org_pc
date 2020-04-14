<template>
	<Modal v-drag-modal :mask-closable="false" width="780" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
			<Form :label-width="100" ref="form" :model="info" :rules="rules">
				<Form-item prop="class_name" label="班级名称">
					<Input style="width: 380px;" v-model="info.class_name" clearable placeholder="请输入班级名称"></Input>
				</Form-item> 
				<Row>
					<Col span="14">
						<Form-item label="所属课程" prop="lid">
		        			<select-lesson v-model="info.lid" :condition="{lesson_type:[0]}" :allow-type="[0]"></select-lesson>
		        		</Form-item>
		        	</Col>
	        		<Col span="10">
		        		<Form-item label="年级" prop="grade" v-if="enable_grade">
		        			<Select v-model="info.grade" placeholder="">
								<Option :value="item.name" v-for="item in filter_grades">{{item.title}}</Option>
							</Select>
		        		</Form-item>
		        	</Col>
        		</Row>
				<Form-item label="科目" prop="sj_id">
        			<Select v-model="info.sj_id" @on-change="subjectChange" style="width: 380px;">
        				<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
        			</Select>
        		</Form-item>
        		<Form-item label="科目级别" prop="sg_id" v-if="subject_grades.length>0">
        			<Select v-model="info.sg_id" style="width: 380px;" @on-change="subjectGradeChange">
        				<Option v-for="item in subject_grades" :value="item.sg_id">{{item.title}}</Option>
        			</Select>
        		</Form-item>
        		
        		<Row>
        			<Col span="12">
		     			<Form-item prop="teach_eid" :label="label_teacher">
		        			<select-employee :rid="1" v-model="info.teach_eid" :limit-per="false" clearable></select-employee>
		        		</Form-item>	
        			</Col>
        			<Col span="12">
        				<Form-item prop="class_type" label="类型" v-help="'补课班仅用于缺课学员补课，活动班适用于所有学员'">
		        			<RadioGroup v-model="info.class_type" type="button">
		        				<Radio :label="1">补课班</Radio>
		        				<Radio :label="2">活动班</Radio>
		        			</RadioGroup>
		        		</Form-item>
        			</Col>
        		</Row>
        		<Row>
        			<Col span="12">
        				<Form-item prop="cr_id" label="教室"> 
				            <select-class-room v-model="info.cr_id"></select-class-room>						           
		        		</Form-item>
        			</Col>
        			<Col span="12">
        				<Form-item prop="plan_student_nums" label="预招人数" v-help="'预招人数不填或为0则不限制班级人数'"> 
				            <input-number v-model="info.plan_student_nums" :min="0"></input-number>					           
		        		</Form-item>
        			</Col>
        		</Row>
				
        		<Row>
        			<Col span="12">
        				<Form-item label="开课日期" prop="start_lesson_time">        					
		                	<DatePicker
			            		transfer
			                	type="date" 
			                	placeholder="开课日期" 
			                	format="yyyy-MM-dd" 
			                	:value="info.start_lesson_time"
			            		@on-change="info.start_lesson_time = $event"
			                	>
		                	</DatePicker>	
			            </Form-item>
        			</Col>
        			<Col span="12">
        				<Form-item label="结课日期" prop="end_lesson_time">
		                	<DatePicker
			            		transfer
			                	type="date" 
			                	placeholder="结课日期" 
			                	format="yyyy-MM-dd" 
			                	:value="info.end_lesson_time"
			                	:options="endOptions"
			            		@on-change="info.end_lesson_time = $event"
			                	>
		                	</DatePicker>	
			            </Form-item>
        			</Col>
        		</Row>
        			
	            
	            <Form-item label="上课时段" v-if="modal$.show">
        			<class-arrange-table 
        			v-model="info.schedules" 
        			:class-type="info.class_type" 
        			:cid="info.cid"
        			:lid="info.lid"
        			:eid="info.teach_eid" 
        			:cr-id="info.cr_id"
        			:second-eids="info.second_eids"
        			from="classes"
        			>
        				
        			</class-arrange-table>        			
        		</Form-item>
			</Form>	
	    </template>
    	<div slot="footer">
            <Button type="ghost" @click="close" :loading="saving">取消</Button>
            <Button type="primary" @click="saveClass" :loading="saving">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectLesson from 'c%/SelectLesson'
	import SelectEmployee from 'c%/SelectEmployee'
	import SelectClassRoom from 'c%/SelectClassRoom'
	import ClassArrangeTable from './class-arrange-table.vue'
	
	const INFO_NAME = '班级'
	const INFO_PK_ID = 'cid'
	const INFO_URL   = 'classes/tmp_class'

	const classObject = {
		cid: 0,
		class_name: '',
		class_no: '',
		year: moment(new Date()).format('YYYY'),
		season: 'C',
		lid: 0,
		grade:0,
		sj_id:'',
		sg_id:0,
		bid: 0,
		teach_eid: 0,
		second_eid:0,
		second_eids: [],
		edu_eid: 0,
		start_lesson_time: '',
		end_lesson_time: '',
		plan_student_nums: 0,
		lesson_times: 1,
		cr_id: '',
		schedules: [],
		course_arrange:0,
		is_check:1,
		exclude_holidays:1,
		subject_grade:0,
		unit_price:0.00,
		per_lesson_hour_minutes:0,
		consume_lesson_hour:1.00,
		class_type: 1
	}

	export default{
		name:'classInfoModal',
		mixins:[globals,modal,common],
		components: {
			SelectLesson,
			SelectEmployee,
			SelectClassRoom,
			ClassArrangeTable
		},
		props:{
			editMode:{
				type:String,
				default:'all'
			},
			upInfo: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		data () {
			return {
				canChange:false,
				info: util.copy(classObject),
				rules: {
					class_name: [
						{ required: true, message:'请输入班级名称', trigger: 'change' }
					],				
					sj_id:[
						{required:true,type:'number',min:1,message:'请选择教室',trigger:'change'}
					],
					start_lesson_time: [
						{ required: true, message:'请选择班级开课日期', trigger: 'change' }
					],
					end_lesson_time: [
						{ required: true, message:'请选择班级结课日期', trigger: 'change' }
					]					
				}
			}
		},
		watch: {
			'info.cr_id': function(val){
				if(this.modal$.action == 'edit' && !this.canChange){
					this.canChange = true
					return
				}		
				let class_room = this.getClassRoomObj(val)
				if(class_room){
					this.info.plan_student_nums = class_room.seat_nums					
				}
			},
			'info.lid':function(val){
				if(this.enable_grade && val > 0){
					let lesson = this.getLessonObj(val)
					if(this.info.grade < lesson.fit_grade_start || this.info.grade > lesson.fit_grade_end){
						this.info.grade = lesson.fit_grade_start
					}
				}
			},
			'modal$.show':{
	            handler:function(val){
	            	if(val&&this.modal$.action == 'add'){
	            		this.init_info()
					}
	            }
	        }
        },
		mounted () {
			
		},
		methods: {
			init_info(){
				this.info = util.copy(classObject)
				this.init_time()
				if(!_.isEmpty(this.upInfo)) {
					Object.assign(this.info,this.upInfo)
					this.$nextTick(()=>{
						if(this.subject_grades.length===0) {
							this.$Message.info('暂无级别，请先添加科目级别')
							this.info.subject_grade = 0
						}
					})
				}
			},
			init_time () {
				this.get_season()
				this.auto_season_date()
			},
			auto_season_date () {				
				let season_date = this.season_date,
					current_year = this.info.year
				if(season_date){					
					this.info.start_lesson_time = moment(new Date()).format('YYYY-MM-DD')		
				}
			},
			get_season () {
				this.info.season = util.auto_season()
			},
			subjectChange(value){
				this.info.subject_grade = 0
			},
			subjectGradeChange(value) {
				this.info.subject_grade = this.subject_grades.find(item => item.sg_id == value).grade
			},
			saveClass(){
				if(this.class_must_sel_lesson){
					if(this.info.lid == 0){
						this.$Message.error('请选择所属课程!')
						return false
					}
				}
				if(this.info.schedules.length==0){				
					this.$Message.error('请添加上课时段!')
					return false				
				}
				
				
				this.save()
			}
		},
		computed: {
			endOptions () {
				let startTime = new Date(this.info.start_lesson_time).getTime()
				return {
					disabledDate (date) {						
	                    return date && date.valueOf() < startTime - 86400000;
	                }
				}				
			},
			season_date () {
				let [bid,year,season] = [this.bid$,this.info.year,this.info.season]
				let season_date = this.get_season_dates(bid,year,season)||{}				
				let current_year = this.info.year
				if(!_.isEmpty(season_date)){
					season_date.int_day_start = season_date.int_day_start.toString().replace('9999',current_year).replace(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2})$/, "$1-$2-$3")					
					season_date.int_day_end = season_date.int_day_end.toString().replace('9999',current_year).replace(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2})$/, "$1-$2-$3")
				
				}
				
				return season_date
			},
			season () {
				return this.$store.state.gvars.dicts['season']
			},
			subjects(){
				let origin = this.$store.state.gvars.subjects
				
				if(this.info.lid > 0){
					let lesson = this.getLessonObj(this.info.lid)
					
					if(lesson) {
						origin = origin.filter(o=>lesson.sj_ids.includes(o.sj_id))
					}
				}
				
				return origin
			},
			
			subject_grades() {
				let data = []
				let subject = this.getSubjectObj(this.info.sj_id)
				if(subject&&subject.subject_grade) {
					subject.subject_grade.forEach(g=>{
						let obj = util.copy(g)
						if(obj.title == ''){
							obj.title = g.grade+'级'
						}
						data.push(obj)
					})
				}
				return data
			},
			info_url$(){
				if(this.modal$.action=='add'){
					return INFO_URL					
				}else{
					return 'classes'
				}
				
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        },
	        filter_grades(){
	        	if(this.info.lid == 0){
	        		return this.grades
	        	}
	        	let info = this.getLessonObj(this.info.lid)
	        	return this.grades.filter(item=>{
	        		if(item.name >= info.fit_grade_start && item.name <= info.fit_grade_end){
	        			return true
	        		}
	        		return false
	        	})
	        }

		}
	}
</script>
