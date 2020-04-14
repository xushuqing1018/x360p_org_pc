<template>
	<Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="680" v-drag-modal>
		<Form ref="ref" :label-width="100" :model="info" :rules="addRule">
			<div class="row">
				<Form-item label="补课课程" prop="lid" class="col-sm-6" required>
					<select-lesson v-model="info.lid" clearable :disabled="lid>0"></select-lesson>
				</Form-item>
				<Form-item prop="sj_id" label="科目" v-if="subjects.length" class="col-sm-6">
					<Select v-model="info.sj_id">
						<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
					</Select>
				</Form-item>
			</div>
			<div class="row">
				<Form-item :label="label_teach_teacher" prop="teach_eid" class="col-sm-6" required>
					<select-employee :limit-per="select_teacher_limit" :rid="1" v-model="info.teach_eid" clearable></select-employee>
				</Form-item>
				<Form-item label="助教" prop="second_eid" class="col-sm-6">
					<select-employee :limit-per="select_teacher_limit" :rid="2" v-model="info.second_eid" clearable></select-employee>
				</Form-item>
			</div>
			<div class="row">
				<Form-item label="上课日期" prop="int_day" class="col-sm-6">
					<Date-picker type="date" placeholder="上课日期" format="yyyy-MM-dd" v-model="info.int_day"></Date-picker>
				</Form-item>
				<Form-item label="教室" prop="cr_id" class="col-sm-6">
					<select-class-room v-model="info.cr_id"></select-class-room>
				</Form-item>
			</div>
			<div class="row">
				<Form-item label="开始时间" prop="int_start_hour" class="col-sm-6">				
					<Time-picker confirm @on-change="setIntStartHour" style="width:80px" size="small" :value="info.int_start_hour" format="HH:mm" :steps="[1,15,15]" placeholder="00:00"></Time-picker>
					<Select @on-change="setIntEndHourByTimelong" size="small" style="width:80px;" class="ml-3">
				        <Option v-for="item in timelong" :value="item.name" :key="item.name">{{ item.desc }}</Option>
				   </Select>        			
				</Form-item>	
				<Form-item label="结束时间" prop="int_end_hour" class="col-sm-6">
	        		<Time-picker confirm @on-change="info.int_end_hour = $event" style="width:80px" size="small" :value="info.int_end_hour" format="HH:mm" :steps="[1,15,15]" placeholder="00:00"></Time-picker>
	        	</Form-item>
	        </div>
			<template v-if="enable_money_consume">
				<div class="row">
					<Form-item prop="consume_source_type" label="课消来源" class="col-sm-6"> 
						<RadioGroup type="button" v-model="info.consume_source_type">
							<Radio :label="1">课时</Radio>
							<Radio :label="2">电子钱包</Radio>
						</RadioGroup>
					</Form-item>
					
					<Form-item prop="consume_lesson_hour" label="扣课时数" class="col-sm-6" v-if="info.consume_source_type == 1">						
						<InputNumber v-model="info.consume_lesson_hour" style="width:60px"></InputNumber>
						<span class="ml-2">课时</span>	
					</Form-item>
					<Form-item prop="consume_lesson_amount" label="课耗金额" class="col-sm-6" v-if="info.consume_source_type == 2">
						<InputNumber v-model="info.consume_lesson_amount" style="width:60px"></InputNumber>
						<span class="ml-2">元</span>
					</Form-item>
				</div>
				<div class="row">
					<Form-item label="排课备注" prop="name" class="col-sm-12">
						<Input v-model="info.name" placeholder="请输入补课备注"></Input>
					</Form-item>
				</div>
			</template>
			<template v-else>
				<div class="row">
					<Form-item prop="consume_lesson_hour" label="扣课时数" class="col-sm-6">						<InputNumber v-model="info.consume_lesson_hour" style="width:60px"></InputNumber>
						<span class="ml-2">课时</span>	
					</Form-item>
					<Form-item label="排课备注" prop="name" class="col-sm-12">
						<Input v-model="info.name" placeholder="请输入补课备注"></Input>
					</Form-item>
				</div>
			</template>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="cancel" :disabled="saving">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>	
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import $rest from '@/libs/rest'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectClassRoom from 'c%/SelectClassRoom.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	
	export default{
		mixins: [modal,common],
		props: {
			lid: {
				type: Number,
				default: ()=>{
					return 0
				}
			},
			type: {
				type: String,
				default: ()=>{
					return 'is_trial'
				}
			}
		},
		components: {
			selectLesson,
			selectEmployee,
			selectClassRoom,
		},
		data () {			
			const validate = (rule, value, callback) => {
				if(value>0){
					callback();
				}else{
					callback(new Error('请选择课程'))
				}
			}
			return {
				info: {
					lid: 0,
					bid: 0,
					sj_id:0,
					cr_id: 0,
					name: '',
					second_eid: 0,
					int_day: '',
					teach_eid: 0,
					int_end_hour: '',	
					int_start_hour: '',	
					consume_source_type:1,
					consume_lesson_hour:1,
					consume_lesson_amount:0
				},
				addRule: {
					
					int_day: [
						{ required: true, type: 'date', message: '请选择上课日期', trigger: 'change' }
					],		
					lid: [
						{ required: true, type: 'number', min: 1, message: '请选择课程', trigger: 'blur' },
					],
					teach_eid: [
						{ required: true, type: 'number', min: 1, message: '请选择老师', trigger: 'blur' },
					],
					cr_id: [
						{ required: true, type: 'number', min: 1, message: '请选择教室', trigger: 'change' },
					],
					int_start_hour: [
						{ required: true, message: '请选择开始时间', trigger: 'change' },
					],
					int_end_hour: [
						{ required: true, message: '请选择结束时间', trigger: 'change' },
					],
					name: [
						{ required: true, message: '请输入排课备注', trigger: 'blur' }
					],
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(this.lid>0){				
					this.info.lid = this.lid
				}
			},
			'info.lid': function (val) {
				this.$r('ref').validateField('lid')
			},
			'info.teach_eid': function (val) {
				this.$r('ref').validateField('teach_eid')
			}
		},
		computed:{
			timelong(){
				return this.$store.state.gvars.dicts['timelong']
			},
			subjects () {
	        	let lid = this.info.lid,
	        		lessons = this.$store.state.gvars.lessons,
	        		subjects = this.$store.state.gvars.subjects,
	        		sj_ids = []
	        		
	        		if(lid > 0){
	        			let obj = lessons.find(l=>l.lid==lid)
	        			if(obj){        				
	        				sj_ids = obj.sj_ids
	        			}
	        		}
	        		
	        	return subjects.filter(s=>sj_ids.indexOf(s.sj_id)>-1)        	
	        }
		},
		methods: {
			ok () {
				this.$form('ref').check()
				.then(()=>{
					let obj = util.copy(this.info)
					
					obj[this.type] = 1
					obj.bid = this.bid$
					obj.int_day = util.format_int_day(moment(this.info.int_day).format('YYYY-MM-DD'))
					obj.int_start_hour = util.format_int_hour(this.info.int_start_hour)
					obj.int_end_hour = util.format_int_hour(this.info.int_end_hour)
					this.$emit('on-save-success',obj)
					this.close()
				})
			},
			cancel () {
				this.$form('ref').reset()
				this.close()
			},
			setIntStartHour($event){
				this.info.int_start_hour = $event
			},
			setIntEndHour($event){
				this.info.int_end_hour = $event
			},
			setIntEndHourByTimelong(minute){
				if(this.info.int_start_hour == ''){
					this.$Message.error('请先输入开始时间')
					return false
				}
				let minutes = util.int(minute)
				this.info.int_end_hour = util.int_hour_add_minutes(this.info.int_start_hour,minutes)
			},
		}
	}
</script>
