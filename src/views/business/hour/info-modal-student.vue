<style lang="less" scoped>
	.student-hours-wrap {
		.lesson-hour-list {
			border: 1px solid #e3e8ee;
			max-height: 100px;
			line-height: 20px;
		    overflow-y: auto;
		    overflow-x: hidden;
		    padding-top: 8px;
		}
	}
</style>
<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" width="550">
		<div slot="header">
			<strong>{{modal$.title}}</strong>
			<Button class="ml-3" size="small" type="default" @click="addByClass" v-if="hide_toggle == 0">按班级登记</Button>
		</div>
		<Form ref="form" :label-width="100" :model="info">
			<Form-item label="学员" prop="sid" class="custom-form-item-required">
				<select-student 
					v-model="info.sid" 
					placeholder="请选择学员" 
					@on-selected="selectStudent">
				</select-student>
			</Form-item>
			
			<Form-item label="课消类型" class="custom-form-item-required">
				<RadioGroup v-model="info.consume_type" type="button" @on-change="consumeTypeChange">
					<Radio :label="0">课时课消</Radio>
					<Radio :label="3">违约课消</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="扣课方式" class="custom-form-item-required">
				<RadioGroup v-model="info.source_type" type="button" @on-change="sourceTypeChange">
					<Radio :label="1">扣课时</Radio>
					<Radio :label="2">扣余额</Radio>
				</RadioGroup>
			</Form-item>
			<template v-if="info.consume_type == 0 && info.source_type == 2">
				<Form-item label="授课方式" class="custom-form-item-required">
					<RadioGroup v-model="info.lesson_type" type="button">
						<Radio :label="0">班课</Radio>
						<Radio :label="1">1对1课</Radio>
						<Radio :label="2">1对多课</Radio>
						<Radio :label="3">研学旅行团</Radio>
					</RadioGroup>
				</Form-item>
				<template v-if="info.lesson_type > 0">
					<Form-item label="课消课程" class="custom-form-item">
	        			<select-lesson 
	        			v-model="info.lid" 
	        			:clearable="true" 
	        			:condition="{lesson_type:[info.lesson_type]}" 
	        			:allow-type="[1,2,3]"
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
						placeholder="请选择班级" 
					>
					</select-class>
				</Form-item>
			</template>
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
			<Form-item label="课时数" prop="lesson_hours" class="custom-form-item-required" v-if="info.source_type==1">
				<InputNumber v-model="info.lesson_hours" :min="0" :max="currentMaxNums" @on-change="changeLessonHours"></InputNumber>
				<!-- <span>&nbsp;&nbsp;&nbsp;课时，合{{info.lesson_amount}}元</span> -->
			</Form-item>
			<Form-item label="课消金额" v-else class="custom-form-item-required">
				<InputNumber v-model="info.lesson_amount" :min="0" :max="info.sl_id>0?money:Infinity"></InputNumber>
				<span v-if="info.sid>0">(钱包余额: {{money}})</span>
			</Form-item>
			<Form-item prop="int_day" label="课消日期">
	            <DatePicker 
		            type="date"
		            :value="info.int_day"
		            @on-change="info.int_day = $event"
		            placeholder="选择日期"
		            >		            
	            </DatePicker>
			</Form-item>
			<Form-item label="课消备注" class="custom-form-item-required" prop="remark">
				<Input v-model="info.remark" placeholder="请填写原因，因为什么扣除学员的课时"></Input>
			</Form-item>
			<p class="text-center col-sm-12 mb-3" v-if="info.consume_type==0">
				<a class="text-info" @click="show_extra=!show_extra">
					{{show_extra?'收起':'高级'}}
					<Icon :type="show_extra?'chevron-up':'chevron-down'"></Icon>
				</a>
			</p>
			<div v-show="show_extra&&info.consume_type==0">
				<Alert show-icon>选择{{'老师'|translate}}以后，对应会产生{{'老师'|translate}}的产出记录</Alert>
				<Form-item prop="ts_array" label="课消时段">
					<select-time-section 
						clearable
						:value="ts_array" 
						:date="info.int_day" 
						@on-change="changeTimeSection"
						placeholder="请选择时间段">
					</select-time-section>
				</Form-item>
				<Form-item prop="eid" :label="label_teacher">
					<select-employee v-model="info.eid" clearable :rid="1" :placeholder="label_choose_teacher"></select-employee>
				</Form-item>
			</div>
			
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
		lesson_type:0,
		lesson_hours: 0,
		lesson_amount: 0.00,
		remark: '',
		eid: 0,
		lid:0,
		cid:0,
		sj_id:0,
		int_start_hour: '',
		int_end_hour: '',
		int_day: moment().format('YYYY-MM-DD'),
		consume_type: 0,
		source_type: 1,
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
			consumeTypeChange(v) {
				if(v == 0) {
					this.info.source_type = 1
					if(this.info.sl_id !== 0) {
						this.info.lesson_amount = this.cacuLessonAmount()
					}else{
						this.info.lesson_amount = 0
					}
				}else{
					this.info.source_type = 2
				}
				this.sourceTypeChange(this.info.source_type)
			},
			sourceTypeChange(v) {
				if(v == 1) {
					if(this.info.sl_id !== 0) {
						this.info.lesson_amount = this.cacuLessonAmount()
					}else{
						this.info.lesson_amount = 0
					}
				}else if(v == 2) {
					this.info.lesson_hours = 0
					this.info.lesson_amount = 0
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
				this.$rest('students').add_url_param(student.sid,'student_lessons')
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
				return util.mul(this.info.lesson_hours,unit_amount)
			},
			ok () {
				if(!this.info.sid) {
					this.$Message.error('请选择学员')
					return false
				}
				
				if(this.info.source_type==1) {
					if(!this.info.sl_id) {
						this.$Message.error('请选择要消耗的课程')
						return false
					}
					if(!this.info.lesson_hours) {
						this.$Message.error('消耗课时不能为0')
						return false
					}
				}else{
					if(!this.info.lesson_amount) {
						this.$Message.error('扣除金额不能为0')
						return false
					}else{
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
				if(this.info.remark == ''){
					this.$Message.error('请填写课消备注')
					return false
				}
				
				this.$rest('student_lesson_hours')
				.post(this.info)
				.success(res => {
					
					this.$Message.success('登记成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			addByClass() {
				this.$emit('on-class')
				this.close()
			}
		}
	}
</script>