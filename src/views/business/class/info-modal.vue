<template>
	<Modal v-drag-modal :mask-closable="false" width="750" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
			<Form :label-width="100" ref="form" :model="info" :rules="rules" class="error-tip-none">
				<Row>
					<Col span="12">
						<Form-item prop="class_name" label="班级名称">
							<Input v-model="info.class_name" clearable placeholder="请输入班级名称"></Input>
						</Form-item>
					</Col>
					<Col span="12">
						<Form-item label="所属课程" prop="lid" v-if="class_must_sel_lesson" :class="{'ivu-form-item-required':class_must_sel_lesson}">
		        			<select-lesson v-model="info.lid" :clearable="true" :condition="{lesson_type:[0]}" :allow-type="[0]"></select-lesson>
		        		</Form-item>
		        	</Col>
		        	<Col span="12">
		        		<Form-item label="科目" prop="sj_id">
		        			<Select v-model="info.sj_id" @on-change="subjectChange">
		        				<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
		        			</Select>
		        		</Form-item>
		        	</Col>
		        	<Col span="12">
		        		<Form-item label="科目级别" prop="sg_id" v-if="subject_grades.length>0">
		        			<Select v-model="info.sg_id" @on-change="subjectGradeChange">
		        				<Option v-for="item in subject_grades" :value="item.sg_id">{{item.title}}</Option>
		        			</Select>
		        		</Form-item>
		        	</Col>
		        	<Col span="12">
		        		<Form-item label="年级" prop="grade" v-if="enable_grade">
		        			<Select v-model="info.grade" placeholder="">
								<Option :value="item.name" v-for="item in filter_grades">{{item.title}}</Option>
							</Select>
		        		</Form-item>
		        	</Col>
        		</Row>
				
        		<Row>
        			<Col span="12">
		     			<Form-item prop="teach_eid" :label="label_teacher">
		        			<select-employee :rid="1" v-model="info.teach_eid" :limit-per="select_teacher_limit" clearable></select-employee>
		        		</Form-item>	
        			</Col>
        			<Col span="12">
		     			<Form-item prop="edu_eid" :label="label_eduer">
		        			<select-employee :rid="4" v-model="info.edu_eid" :limit-per="select_teacher_limit" clearable></select-employee>
		        		</Form-item>	
        			</Col> 
        			<Col span="12">
						<Form-item prop="second_eids" :label="label_secteacher">
		        			<select-employee :rid="2" v-model="info.second_eids" @select="selectSecondEids" :limit-per="select_teacher_limit" clearable></select-employee>
		        		</Form-item>
        			</Col>
        			<Col span="12">
        				<Form-item prop="cr_id" label="教室"> 
				            <select-class-room v-model="info.cr_id"></select-class-room>
		        		</Form-item>
        			</Col>   
        			
        			<Col span="12">
        				<Form-item prop="consume_source_type" label="课消来源"> 
				            <RadioGroup type="button" v-model="info.consume_source_type">
				            	<Radio :label="1">课时</Radio>
				            	<Radio :label="2">电子钱包</Radio>
				            </RadioGroup>
		        		</Form-item>
        			</Col>
        			<Col span="12">
		       			<Form-item label="开课日期" prop="start_lesson_time">        					
		                	<DatePicker
			            		transfer
			                	type="date" 
			                	placeholder="开课日期" 
			                	format="yyyy-MM-dd" 
			                	:value="info.start_lesson_time"
			            		@on-change="info.start_lesson_time = $event"
			            		style="width: 100%;"
			                	>
		                	</DatePicker>	
			           	</Form-item>
		       		</Col>
		       		<Col span="12">
		       			<Form-item prop="year" label="年份">
							<DatePicker 
								type="year"
								:value="info.year = toString(info.year)" 
								@on-change="info.year = $event" 
								format="yyyy" 
								placeholder="选择年份" 
								style="width: 100%;">
							</DatePicker>
		        		</Form-item>
		       		</Col>
		       		<Col span="12">
		       			<Form-item label="期段" prop="season">
		        			<Select v-model="info.season">
		        				<Option v-for="item in season" :value="item.name">{{item.title}}</Option>
		        			</Select>
		        		</Form-item>
		       		</Col>
		       		<Col span="12">				
						<Form-item prop="plan_student_nums" label="预招人数">
							<Input-number v-model="info.plan_student_nums" style="width: 100%;"></Input-number>
						</Form-item>
					</Col>
					<Col span="12">
						<Form-item prop="lesson_times" label="上课次数">
							<Input-number v-model="info.lesson_times" style="width: 100%;"></Input-number>
						</Form-item>
			       </Col>
        		</Row>
        		<Row>
        			<Col span="14">
		        		<Form-item label="" prop="course_arrange" v-if="modal$.action=='add'">
		    				<Checkbox v-model="info.course_arrange" :true-value="1" :false-value="0">生成排课记录</Checkbox>
		    				<template v-if="info.course_arrange">
		        				<Checkbox v-model="info.is_check" :true-value="1" :false-value="0">检测上课冲突</Checkbox>
		        				<Checkbox v-model="info.exclude_holidays" :true-value="1" :false-value="0">跳过节假日</Checkbox>
		    				</template>
		    				
						</Form-item>
					</Col>
					<Col span="10">
						<Form-item label="">
							<Checkbox v-model="info.is_online" :true-value="1" :false-value="0" v-if="enable_online_lesson">这是一个线上课班级</Checkbox>
						</Form-item>
					</Col>
				</Row>
        		<Form-item label="上课时段" v-if="modal$.show">
        			<class-arrange-table 
        				v-model="info.schedules" 
        				:cr-id="info.cr_id" 
        				:cid="info.cid" 
        				:lid="info.lid"
        				:eid="info.teach_eid" 
        				:second-eids="info.second_eids" 
        				:season="info.season"
        				from="classes"
        				>
        			</class-arrange-table>        			
        		</Form-item>
			</Form>	
	    </template>
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="saveClass">确定</Button>
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
	const INFO_URL   = 'classes'

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
		start_lesson_time: moment(new Date()).format('YYYY-MM-DD'),
		end_lesson_time: '',
		plan_student_nums: 0,
		lesson_times: 14,
		cr_id: '',
		schedules: [],
		course_arrange:1,
		is_check:1,
		exclude_holidays:1,
		subject_grade:0,
		unit_price:0.00,
		per_lesson_hour_minutes:0,
		consume_lesson_hour:1.00,
		consume_source_type: 1,
		is_demo:0,
		is_online:0
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
			},
			isDemo: {
				type: Number,
				default: 0
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
						{required:true,type:'number',min:1,message:'请选择班级所属科目',trigger:'change'}
					],
					teach_eid: [
						{ required: true, type:'number', min:1, message:'请选择'+this.$filter('translate')('老师'), trigger: 'change' }
					],
					cr_id:[
						{required:true,type:'number',min:1,message:'请选择教室',trigger:'change'}
					],			
					plan_student_nums: [
						{ required: true, type: 'number', min:1, message: '请输入计划招生数', trigger: 'change' }
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
				let lesson = this.getLessonObj(val)
				if(this.enable_grade && val > 0){
					if(this.info.grade < lesson.fit_grade_start || this.info.grade > lesson.fit_grade_end){
						this.info.grade = lesson.fit_grade_start
					}
				}
				
				//课程改变=》 未选择科目或所选科目不是课程适用科目时  将科目变为课程第一个适用科目
				if(this.info.sj_id==0||!lesson.sj_ids.includes(this.info.sj_id)){					
					this.info.sj_id = lesson.sj_ids[0]
				}
			},
			'modal$.show':{
	            handler:function(val){
	            	if(val&&this.modal$.action == 'add'){
	            		this.init_info()
	            		this.info.is_demo = this.isDemo
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
				}
			},
			init_time () {
				this.get_season()
				// this.auto_season_date()
			},
			auto_season_date () {				
				let season_date = this.season_date,
					current_year = this.info.year
				if(season_date){					
					this.info.start_lesson_time = season_date.int_day_start		
				}
			},
			get_season () {
				let arr_season_value = []
				this.season.forEach(item=>{
					arr_season_value.push(item.name)
				})

			
			
				let auto_season = util.auto_season()
				if(arr_season_value.indexOf(auto_season) === -1){
					if(arr_season_value.length > 0){
						auto_season = arr_season_value[0]
					}
				}

				this.info.season = auto_season

			},
			subjectChange(value){
				this.info.subject_grade = 0
			},
			subjectGradeChange(value) {
				this.info.subject_grade = this.subject_grades.find(item => item.sg_id == value).grade
			},
			selectSecondEids(model) {
				this.info.second_eid = model.length>0?model[0]:0
			},
			saveClass(){
				if(this.class_must_sel_lesson){
					if(this.info.lid == 0){
						this.$Message.error('请选择所属课程!')
						return false
					}
				}
				if(this.modal$.action=='add') {
					if(this.info.course_arrange&&this.info.schedules.length==0){
						this.$Message.error('勾选了生成排课记录请添加上课时段！')
						return
					}
					if(!this.info.course_arrange&&this.info.schedules.length>0){
						this.confirm('你添加了上课时段但是没有勾选生成排课记录，确定不排课建班吗？')
						.then(() => {
							this.save()
						})
					}else{
						this.save()
					}
				}else{
					this.save()
				}
			}
		},
		computed: {
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
            	return INFO_URL
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
<style lang="less">
	.error-tip-none {
		.ivu-form-item-error-tip {
			display: none;
		}
		.ivu-form-item {
			margin-bottom: 6px;
		}
	}
</style>
