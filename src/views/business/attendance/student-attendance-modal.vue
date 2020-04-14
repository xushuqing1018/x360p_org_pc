
<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" width="550">
		<div slot="header">
			<strong>{{modal$.title}}</strong>
		</div>
		<Form ref="form" :label-width="100" :model="info" class="arrange-info px-4">
			<Form-item label="学员" prop="sid" class="custom-form-item-required">
				<select-student 
					v-model="info.sid" 
					placeholder="请选择学员" 
					@on-selected="selectStudent">
				</select-student>
			</Form-item>	
			<Form-item label="授课方式" class="custom-form-item-required">
				<RadioGroup v-model="info.lesson_type" type="button" size="small">
					<Radio :label="item.value" v-for="(item,index) in enable_lesson_types">{{item.label}}</Radio>
				</RadioGroup>
			</Form-item>

			<template v-if="info.lesson_type > 0">
				<Form-item label="授课课程" class="custom-form-item">
        			<select-lesson 
        			v-model="info.lid" 
        			:clearable="true" 
        			:condition="{lesson_type:[info.lesson_type]}" 
        			:allow-type="[info.lesson_type]"
        			@selected="setLessonAmount"
        			>
        				
        			</select-lesson>
        		</Form-item>
        		<Form-item label="科目" class="custom-form-item-required" >
        			<Select v-model="info.sj_id">
        				<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
        			</Select>
        		</Form-item>
        	</template>
    		<Form-item label="班级" class="custom-form-item-required" v-if="info.lesson_type == 0">
				<select-class 
					v-model="info.cid" 
					@selected="setClass"
					placeholder="请选择班级" 
				>
				</select-class>
			</Form-item>
			<Form-item prop="int_day" label="授课日期">
	            <DatePicker 
		            type="date"
		            :value="info.int_day"
		            @on-change="info.int_day = $event"
		            placeholder="选择日期"
		            >		            
	            </DatePicker>
			</Form-item>
			<Form-item prop="ts_array" label="授课时段">
				<select-time-section 
					clearable
					:value="ts_array" 
					:date="info.int_day" 
					@on-change="changeTimeSection"
					placeholder="请选择时间段">
				</select-time-section>
			</Form-item>
			<Form-item prop="teach_eid" :label="label_teacher">
				<select-employee v-model="info.teach_eid" clearable :rid="1" :placeholder="label_choose_teacher"></select-employee>
			</Form-item>

			<Form-item label="扣课时数" prop="lesson_hours" class="custom-form-item-required" v-if="info.source_type==1">
				<InputNumber v-model="info.consume_lesson_hour" :min="0" :max="currentMaxNums" @on-change="changeLessonHours"></InputNumber>
				<!-- <span>&nbsp;&nbsp;&nbsp;课时，合{{info.lesson_amount}}元</span> -->
			</Form-item>
			<Form-item label="课消金额" class="custom-form-item-required" v-else>
				<InputNumber v-model="info.consume_lesson_amount" :min="0" :max="info.sl_id>0?money:Infinity"></InputNumber>
				<span v-if="info.sid>0">(钱包余额: {{money}})</span>
			</Form-item>
			
			<Form-item label="课时记录" prop="sl_id" class="custom-form-item-required" v-show="info.source_type == 1">
				<div class="student-hours-wrap">
					<span v-if="!table_data.length">{{info.sid==0?'请先选择学员':'该学员暂无数据'}}</span>
					<ul class="lesson-hour-list" v-else>
						<li class="mb-2 row">
							<div class="col-sm-8"><Icon type="record" color="#fff" class="px-2"></Icon>课程/班级</div>
							<div class="col-sm-4">剩余课时</div>
						</li>
						<li v-for="(item,index) in table_data"
							class="mb-2 row x-li cursor"
							@click="selectLesson(item,index)"
							>
							<div class="col-sm-8">
								<Icon type="record" :color="currentIndex===index?'#2d8cf0':'#fff'" class="px-2"></Icon>	
								<span v-if="item.lid > 0">{{item.lid|lesson_name}}</span>
								<span v-else>班:{{item.class_name}}</span>
							</div>
							<div class="col-sm-4">
								{{item.remain_lesson_hours}}
							</div>
						</li>
					</ul>
				</div>
			</Form-item>
			
			
			<Form-item label="考勤备注" class="custom-form-item" prop="lesson_remark">
				<Input v-model="info.lesson_remark" placeholder="考勤备注"></Input>
			</Form-item>
			
			
		</Form>
		<div slot="footer">
			<Checkbox v-model="info.is_push" class="pull-left" :true-value="1" :false-value="0">推送微信模板消息</Checkbox>
			<Button type="ghost" :loading="saving" @click="close">取消</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	import SelectLesson from 'c%/SelectLesson'
	import SelectClass from 'c%/SelectClass.vue'

	const emptyObject = {
		sid: 0,
		sl_id: 0,
		lesson_type:-1,
		source_type:1,
		consume_lesson_hour: 0,
		consume_lesson_amount: 0.00,
		lesson_remark: '',
		teach_eid: 0,
		lid:0,
		cid:0,
		sj_id:0,
		int_start_hour: '',
		int_end_hour: '',
		int_day: moment().format('YYYY-MM-DD'),
		consume_type: 0,
		is_in:1,
		is_push: 0
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectStudent,
			SelectEmployee,
			SelectTimeSection,
			SelectLesson,
			SelectClass
		},
		props: {
			student: {
				type: Object,
				default:()=>{
					return {}
				}
			}
		},
		data() {
			return {
				hide_toggle:0,
				info: util.copy(emptyObject),
				ts_array: [],
				table_data: [],
				currentIndex: -1,
				currentSl:null,
				currentMaxNums: Infinity,
				show_extra:false,
				money: 0	// 学员余额
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
            		this.resetData()
				}	            
	        },
	        'info.sid':function(val){
	        	if(val == 0){
	        		this.table_data.splice(0,this.table_data.length)
	        	}
	        },
	        'info.int_end_hour':function(val){
	        	this.getConsumeHour()
	        }
        },
        computed:{
        	subjects(){
				let origin = this.$store.state.gvars.subjects
				
				if(this.info.lid > 0){
					let lesson = this.getLessonObj(this.info.lid)
					
					if(lesson) {
						origin = origin.filter(o=>lesson.sj_ids.includes(o.sj_id))
					}
				}
				
				return origin
			}
        },
		methods: {
			onModalOpen() {
				if(this.student.sid > 0) {
					this.info.sid = this.student.sid
					this.selectStudent(this.student)
					this.hide_toggle = 1
				}
			},
			resetData(){
				this.info = util.copy(emptyObject)
					this.ts_array.splice(0,this.ts_array.length)
					this.currentIndex = -1
					this.currentMaxNums = Infinity
					this.table_data.splice(0,this.table_data.length)
			},
			sourceTypeChange(v) {
				if(v == 1) {
					if(this.info.sl_id !== 0) {
						this.info.lesson_amount = this.cacuLessonAmount()
					}else{
						this.info.lesson_amount = 0
					}
				}else if(v == 2) {
					this.info.consume_lesson_hour = 0
					this.info.consume_lesson_amount = 0
				}
			},
			changeTimeSection(event) {
				if(event.length) {
					this.info.int_start_hour = event[0]
					this.info.int_end_hour   = event[1]
				}else{
					this.info.int_start_hour = ''
					this.info.int_end_hour   = ''
				}
			},
			selectStudent(student) {
				this.money = Number(student.money)
				this.$rest('students')
				.add_url_param(student.sid,'student_lessons')
				.get({
					with: 'order_items'
				})
				.success(res => {
					this.table_data = res.list.filter(item => item.remain_lesson_hours>0)
					if(this.table_data.length>0) {
						this.selectLesson(this.table_data[0])
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			selectLesson(item,index) {
				index = index || 0
				this.currentIndex = index
				this.currentMaxNums = util.float(item.remain_lesson_hours)
				this.info.sl_id = item.sl_id
				this.currentSl = item
				if(this.info.lid == 0){
					this.info.lid = item.lid
				}
				if(this.info.sj_id == 0){
					this.info.sj_id = item.sj_ids[0]
				}
			},
			setClass(cls){
				console.log(cls)
			},
			setLessonAmount(item){
				this.info.lesson_amount = util.float(item.unit_price)
			},
			changeLessonHours(value) {
				if(this.info.sl_id == 0) return
				this.info.lesson_amount = this.cacuLessonAmount()
			},
			cacuLessonAmount() {
				let currentItem = this.table_data[this.currentIndex],
					use = currentItem.use_lesson_hours,
					remain = currentItem.remain_lesson_hours,
					unit_amount = 0
				if(currentItem.order_items && currentItem.order_items.length>0) {
					unit_amount = currentItem.order_items[0].unit_lesson_hour_amount
				}else{
					unit_amount = 0
				}
				return util.mul(this.info.consume_lesson_hour,unit_amount)
			},
			getConsumeHour () {
				let params = {
					cid: this.info.cid,
					int_start_hour: this.info.int_start_hour,
					int_end_hour: this.info.int_end_hour
				}
				
				if(this.info.cid==0){
					delete params.cid
					params.lid = this.info.lid
				}
				
				this.$rest('course_arranges/consume_lesson_hour')
				.get(params)
				.success(data=>{
					this.info.consume_lesson_hour = data.consume_lesson_hour
				}).error(response=>{
					this.$Message.error(response.body.message||'获取扣课时数失败~')
				})
			},
			ok () {
				if(!this.info.sid) {
					this.$Message.error('请选择学员')
					return false
				}

				if(this.info.lesson_type === -1){
					this.$Message.error('请选择授课方式')
					return false
				}
				
				if(this.info.source_type==1) {
					if(!this.info.sl_id) {
						this.$Message.error('请选择要扣的课时记录')
						return false
					}
					if(this.info.sj_id == 0 ){
						this.$Message.error('请选择授课科目')
						return false
					}

					if(this.currentSl){
						if(this.info.lesson_type > 0 && this.currentSl.lid != this.info.lid){
							this.$Message.error('授课课程与课时的课程不匹配')
							return false
						}
					}

				}else{
					if(this.info.lesson_amount) {
						if(this.info.lesson_amount>this.money) {
							this.$Message.error('扣除金额不能大于钱包余额')
							return false
						}
					}
					if(this.info.consume_type == 0) {
						if(this.info.lesson_type == 0){
							if(this.info.cid == 0){
								this.$Message.error('请选择班级')
								return false
							}
						}else{
							if(this.info.sj_id == 0){
								this.$Message.error('请选择科目')
								return false
							}
						}
					} 
				}
			
				
				this.$rest('student_attendances')
				.post(this.info)
				.success(res => {
					this.$Message.success('登记成功')
					this.$emit('update')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>