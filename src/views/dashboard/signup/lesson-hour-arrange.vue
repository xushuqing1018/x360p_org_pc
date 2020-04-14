<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<Row :gutter="10">
			<Col span="10">
				<Form :label-width="50">
					<Form-item label="日期段">
						<date-range-picker 
							v-model="item.lha.int_day" 
							label="请选择日期段" 
							placement="bottom"
							size="small"
							style="width:100%"
							@on-change="init_data">
						</date-range-picker>
					</Form-item>
					<Form-item label="星期">
						<CheckboxGroup v-model="week_days" @on-change="setLhaWeekDays">
							<Checkbox :label="item.value" v-for="item in map_week">{{item.text}}</Checkbox>
						</CheckboxGroup>
					</Form-item>
					<Form-item label="时间段">
						<TimePicker 
							v-model="item.lha.int_start_hour" 
							:steps="[1, 15]" 
							format="HH:mm" 
							placeholder="开始" 
							size="small"
							style="width: 70px"
							@on-change="init_data"
							>
						</TimePicker>
						~
						<TimePicker 
							v-model="item.lha.int_end_hour" 
							:steps="[1, 15]" 
							format="HH:mm" 
							placeholder="结束" 
							size="small"
							style="width: 70px"
							@on-change="init_data"
							>
						</TimePicker>
						<Select 
							filterable 
							v-model="int_hour" 
							size="small"
							style="width:105px;margin-left:5px;" 
							placeholder="快速选择"
							@on-change="setLhaIntHour"
							>
							<Option :value="item.int_hour" v-for="item in ts">{{item.int_start_hour}}~{{item.int_end_hour}}</Option>
						</Select>
					</Form-item>
					<!--
					<Form-item label="类型">
						<RadioGroup v-model="item.lha.lesson_type" type="button" @on-change="init_data" size="small">
							<Radio :label="2">一对多</Radio>
							<Radio :label="1">一对一</Radio>
						</RadioGroup>
					</Form-item>
				-->
					<div class="form__divider"></div>
					<Form-item label="老师">
						<select-employee 
						size="small"
						v-model="item.lha.teach_eid" 
						:rid="1" 
						clearable 
						@on-selected="init_data"></select-employee>
					</Form-item>
					<Form-item label="课程">
						<p>{{item.lha.lid|lesson_name}}</p>
						<!--<select-lesson v-model="item.lha.lid" clearable @selected="init_data"></select-lesson>-->
					</Form-item>
				</Form>
			</Col>
			<Col span="8" class="middle__arrange">
				<div class="arrange__list">
					<div class="plus-area" v-per="'arrange.add'">
						<Icon type="plus-circled" @click="addCourseArrange"></Icon>
					</div>
					<div class="arrange__header" v-if="filterData.length">
						<span>排课列表：</span>
						<span class="pull-right">共{{filterData.length}}</span>
					</div>
					<div class="arrange__body">
						<div class="arrange__item" :class="{selected:item.select$}" v-for="item in filterData" @click="selectItem(item)">
							<p>
								{{item.int_day|int_date}} {{item.week_text}} 
								<span class="hours" v-if="item.consume_lesson_hour>0">
									/ {{item.consume_lesson_hour}}
									课时
								</span>
							</p>
							<p>
								<span><Icon type="person"></Icon> {{item.teach_eid|ename}}</span>
								<span><Icon type="ios-clock-outline"></Icon> {{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}</span>
							</p>
							<p>
								<Icon type="home"></Icon> {{item.cr_id|classroom_name('-')}}
								<span class="pull-right">{{item.students.length}}/{{item.student_limit}}</span>
							</p>
						</div>
						<div class="text-center" v-if="filterData.length==0">没有符合条件的排课</div>
					</div>
					
				</div>
			</Col>
			<Col span="6">
				<div class="select__list">
					
					<div class="select__clear" v-if="arrange_detail.length">
						<span>已选择：</span>
						
						<span>{{total_lesson_hour}}课时</span>
						<span class="pull-right" @click="clearSelect">清空</span>
					</div>
					<div class="select__body">
						<div class="select__item" v-for="(item,index) in orderBy(arrange_detail,'int_day')">
							<p>{{item.int_day|int_date}} {{item.week_text}}</p>
							<p>
								<span><Icon type="person"></Icon> {{item.teach_eid|ename}}</span>
								<span><Icon type="ios-clock-outline"></Icon> {{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}</span>
							</p>
							<p>
								<Icon type="home"></Icon> {{item.cr_id|classroom_name('-')}}
								<span class="pull-right">{{item.student_num}}/{{item.student_limit}}</span>
							</p>
							<Icon type="ios-trash" @click.native="deleteItem(index)"></Icon>
						</div>
						<div class="text-center" v-if="arrange_detail.length==0">没有选择排课</div>
					</div>
					
				</div>
			</Col>
		</Row>
		<div slot="footer">
			<span class="pull-left" style="line-height: 34px;">共选择 {{arrange_detail.length}} 个上课时段，{{total_lesson_hour}} 个课时</span>
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee'
	import SelectLesson from 'c%/SelectLesson'
	import SelectTimeSection from 'c%/SelectTimeSection'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins: [grid,modal,common,globals],
		props: {
			item: {
				type: Object,
				default() {
					return {
						lha: {
							int_day: [],
							teach_eid: [],
							lid: 0,
							int_start_hour:'',
							int_end_hour:'',
							week_days: [],
							lesson_type: 2
						}
					}
				}
			},
			student:{
				type: Object,
				default() {
					return {
						sid:0
					}
				}
			}
		},
		components: {
			SelectEmployee,
			DateRangePicker,
			SelectLesson,
			SelectTimeSection
		},
		data() {
			return {
				rest_api: 'course_arranges',
				arrange_detail:[],
				week_days: [],
				int_hour: '',
				map_week: [
					{value:1,text:'一'},
					{value:2,text:'二'},
					{value:3,text:'三'},
					{value:4,text:'四'},
					{value:5,text:'五'},
					{value:6,text:'六'},
					{value:0,text:'日'}
				]
			}
		},
		mounted() {
			this.init_data()
		},
		computed: {
			filterData() {
				if(this.week_days.length) {
					return this.data.filter(item => this.week_days.indexOf(item.week_day) > -1)
				}
				return this.data
			},
			ts() {
				let time_sections = this.$store.state.gvars.time_sections.filter(s => s.bid == this.bid$)
				if(time_sections.length == 0) {
					time_sections = this.$store.state.gvars.time_sections.filter(s => s.bid == 0)
				}
				let ret = []
				time_sections.forEach(s => {
					s.int_hour = s.int_start_hour+'~'+s.int_end_hour
					s.int_start_hour_number = Number(this.$filter('format_int_hour')(s.int_start_hour))
					if(ret.findIndex(r => r.int_hour==s.int_hour) == -1) {
						ret.push(s)
					}
				})
				return this.orderBy(ret,'int_start_hour_number')
			},
			total_lesson_times(){
				return this.arrange_detail.length
			},
			total_lesson_hour() {
				let total = 0
				this.arrange_detail.forEach(a => {
					total += a.consume_lesson_hour
				})
				return total
			},
			need_arrange_hour(){
				return this.item.nums + this.item.present_lesson_hours
			}
		},
		methods: {
			onModalOpen() {
				if(this.item.lha.arrange_detail) {
					this.arrange_detail = this.item.lha.arrange_detail
				}
				this.week_days = this.item.lha.week_days
			},
			hook_get_param(params) {
				let search_field = util.copy(this.item.lha)
				delete search_field.arrange_detail
				for(let o in search_field) {
					let property = search_field[o]
					if(o == 'int_day') {
						if(property!==','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}
					else if(o == 'teach_eid') {
						if(property!==','&&property.length>0){
							params[o] = util.sprintf('[in,%s]',property.join(','))
						}
					}
					else if(o == 'int_start_hour' || o == 'int_end_hour') {
						if(property!=='') {
							params[o] = this.$filter('format_int_hour')(property)
						}
					}
					else {
						if(o!=='week_days'
							&&property
							&&property!=-1) {
							params[o] = property
						}
					}
				}
				params.with = 'students'
				params.pagesize = 1000
				params.order_field = 'int_day'
				params.order_sort = 'asc'
			},
			deal_data(data) {
				data.list.forEach(item => {
					let index = this.arrange_detail.findIndex(a => a.ca_id == item.ca_id)
					item.week_day = new Date(this.$filter('int_date')(item.int_day)).getDay()
					item.week_text = '周'+this.map_week.find(w => w.value == item.week_day).text
					item.int_month = moment(new Date(this.$filter('int_date')(item.int_day))).format('DD/MM')
					if(index == -1) {
						this.$set(item,'select$',false)
					}else{
						this.$set(item,'select$',true)
					}
				})
				return data.list
			},
			refreshData() {
				this.data.forEach(item => {
					let index = this.arrange_detail.findIndex(a => a.ca_id == item.ca_id)
					if(index == -1) {
						this.$set(item,'select$',false)
					}else{
						this.$set(item,'select$',true)
					}
				})
			},
			selectItem(item) {
				if(item.students.length >= item.student_limit) {
					this.$Message.error('该次课已满编')
					return
				}
				let index = this.arrange_detail.findIndex(a => a.ca_id == item.ca_id)
				if(index == -1) {
					if(this.total_lesson_hour >= this.need_arrange_hour){
						this.$Message.error('课时已排满')
						return
					}
					this.arrange_detail.push({
						ca_id: item.ca_id,
						int_day: item.int_day,
						int_start_hour: item.int_start_hour,
						int_end_hour: item.int_end_hour,
						teach_eid: item.teach_eid,
						int_month: item.int_month,
						cr_id: item.cr_id,
						week_text: item.week_text,
						student_num: item.students.length,
						student_limit: item.student_limit,
						consume_lesson_hour: Number(item.consume_lesson_hour)
					})
					this.$set(item,'select$',true)
				}else{
					this.arrange_detail.splice(index,1)
					this.$set(item,'select$',false)
				}
			},
			clearSelect() {
				this.arrange_detail.splice(0)
				this.refreshData()
			},
			deleteItem(index) {
				this.arrange_detail.splice(index,1)
				this.refreshData()
			},
			setLhaWeekDays(v) {
				this.item.lha.week_days = v
			},
			setLhaIntHour(v) {
				let arr = v.split('~')
				if(arr.length == 2) {
					this.item.lha.int_start_hour = arr[0]
					this.item.lha.int_end_hour = arr[1]
					this.init_data()
				}
			},
			arrangeClassHours () {
					let uri = `order_items/${this.item.oi_id}/dolha`,
						lha = {}
					lha.arrange_detail = this.arrange_detail
					lha.int_day = this.item.lha.int_day
					lha.int_end_hour = this.item.lha.int_end_hour
					lha.int_start_hour = this.item.lha.int_start_hour
					lha.lesson_type = this.item.lha.lesson_type
					lha.lid = this.item.lha.lid
					lha.teach_eid = this.item.lha.teach_eid
					lha.week_days = this.item.lha.week_days
					this.$rest(uri)
					.post(lha)
					.success(res => {
						this.$emit('on-success')
						this.$Message.success('安排课时成功')
						this.close()
					})
			},
			ok()  {
				let total = this.need_arrange_hour
				this.confirm(util.sprintf('总课时数: %s ，已安排: %s ，共 %s 次，确定吗?',total,this.total_lesson_hour,this.arrange_detail.length))
				.then(() => {
					let type = this.modal$.action
					if(type === 'direct'){
						this.arrangeClassHours()
					}else {
						this.$emit('on-success',this.arrange_detail)
						this.close()
					}
				})
			},
			refreshArrange(){
				this.init_data()
			},
			addCourseArrange(){
				let fixObject = {}
				fixObject.int_day  = ''
				fixObject.lesson_type = this.item.lha.lesson_type
				if(this.item.lha.teach_eid.length > 0){
					fixObject.teach_eid = this.item.lha.teach_eid[0]
				}
				if(this.item.lha.lid > 0){
					fixObject.lid = this.item.lha.lid
				}
				if(this.item.lha.int_start_hour != '' && this.item.lha.int_end_hour != ''){
					fixObject.ts_array = [this.item.lha.int_start_hour,this.item.lha.int_end_hour]
				}
				
				this.$Modal.open('business/class/arrange/info-modal.vue',{
	                on: {
	                    save: () => {
	                        this.refreshArrange()
	                    }
	                },
	                props:{
	                	objectFixed:fixObject,
	                	hideTeachObject:true
	                }
	            })
	            .then(modal => {
	                modal.show('创建排课','add')
	            })
			}
		}
	}
</script>
<style lang="less">
	.middle__arrange {
		position: relative;
		&:after {
			content: ' ';
			position: absolute;
			width: 1px;
			height: 100%;
			top: 0;
			right: 20px;
			background: #dddee1;
			transform: scaleX(0.5);
		}
		&:before {
			content: ' ';
			position: absolute;
			width: 1px;
			height: 100%;
			top: 0;
			left: 20px;
			background: #dddee1;
			transform: scaleX(0.5);
		}
		.arrange__list {
			position:relative;
			height: 500px;
			overflow: hidden;
			padding: 0 30px;
			&::-webkit-scrollbar {
				display: none;
			}
			.arrange__header {
				margin-bottom: 8px;
			}
			.arrange__body{
				height:474px;
				overflow:auto;
			}
			.arrange__item {
				position: relative;
				margin-bottom: 10px;
				cursor: pointer;
				&.selected {
					color: #19be6b;
				}
				&:after {
					position: absolute;
					content: ' ';
					left: 0;
					right: 0;
					bottom: -5px;
					border-bottom: 1px solid #dddee1;
					transform: scaleY(0.5);
				}
				.ivu-icon-ios-checkmark {
					position: absolute;
					top: 2px;
					right: 0;
					font-size: 14px;
				}
			}
			.plus-area{
				position:absolute;
				right:20px;
				bottom:0;
				z-index:2000;
			}
		}
	}
	.form__divider {
		position: relative;
		padding-top: 15px;
		padding-bottom: 15px;
		&:before {
			position: absolute;
			content: ' ';
			right: -25px;
			left: 0;
			top: 4px;
			border-top: 1px solid #dddee1;
			transform: scaleY(0.5);
		}
	}
	.select__list {
		padding-right: 5px;
		height: 500px;
		overflow: auto;
		&::-webkit-scrollbar {
			display: none;
		}
		position:relative;
		.plus-area{
			position:absolute;
			right:0;
			bottom:0;
			z-index:2000;
		}
		.select__body{
			height:474px;
			overflow:auto;
		}
		.select__item {
			position: relative;
			margin-bottom: 8px;
			&:after {
				position: absolute;
				content: ' ';
				left: 0;
				right: 0;
				bottom: -4px;
				border-bottom: 1px solid #dddee1;
				transform: scaleY(0.5);
			}
			.ivu-icon-ios-trash {
				position: absolute;
				top: 2px;
				right: 0;
				cursor: pointer;
				font-size: 14px;
			}
		}
		.select__clear {
			margin-bottom: 8px;
		}
	}
	
</style>