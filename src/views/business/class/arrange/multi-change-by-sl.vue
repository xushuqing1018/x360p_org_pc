<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800" :mask-closable="false">
		<Form :label-width="80">
			<Row style="margin-bottom: 10px;">
				<Col span="12">
					<Form-item label="选择学员" class="mb-2">
						<select-object 
							ref="object" 
							clearable
							title="选择一对多学员"
							:multiple="false"
							:allow-lesson-type="[2]"
							@on-selected="setTeachObject" 
							>
						</select-object>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="日期" class="mb-2">
						<date-range-picker v-model="int_day" style="width:100%"></date-range-picker>
					</Form-item>
				</Col>
			</Row>
		</Form>
		<Row class="sl-change__row">
			<Col span="12" class="sl-change__left">
				<Form :label-width="80">
					<Form-item label="星期" class="mb-2">
						<RadioGroup v-model="left.week_day" type="button">
							<Radio v-for="(item,i) in week_map" :label="i+1">{{week_map[i]}}</Radio>
						</RadioGroup>
					</Form-item>
					<Form-item label="时段" class="mb-2">
						<select-time-section 
	                        clearable
	                        :value="left.tsArray" 
	                        @on-change="changeTimeSection($event,'left')"
	                        placeholder="请选择上课时间段">
	                    </select-time-section>
					</Form-item>
					<Form-item label="老师" class="mb-2">
						<select-employee :rid="1" v-model="left.teach_eid" clearable></select-employee>
					</Form-item>
					<Form-item label="排课" v-if="left.data.length" v-show="!isLoading">
						<div class="list-arrange">
							<div v-if="filterDataLeft.length==0" style="margin-top: 4px;">没有合适的数据</div>
							<div class="item-arrange" v-for="item in filterDataLeft">
								<div class="header">
									<div>
										<span style="font-size: 14px;">{{item.int_day|int_date}}</span>
										<span class="pull-right">
											周{{week_map[item.course_arrange.week_day-1]}}
											{{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}
										</span>
									</div>
									<div>
										<span>
											<Icon type="person"></Icon>
											{{item.course_arrange.teach_eid|ename}}
										</span>
										<span style="margin-left: 4px;">
											<Icon type="home"></Icon>
											{{item.course_arrange.cr_id|classroom_name}}
										</span>
									</div>
								</div>
								<div class="footer">
									<drag
										class="drag" 
										v-for="s in item.course_arrange.course_arrange_students"
										:transfer-data="{cas:s}"
										@dragstart="dragStart('course_arrange_student',s)"
										@dragend="dragEnd"
										style="display: inline-block;"
										>
										<Tag 
											type="border"
											:color="s.sid==selected.sid?'green':'default'"
											>
											{{s.student.student_name}}
										</Tag>
									</drag>
								</div>
							</div>
						</div>
					</Form-item>
				</Form>
			</Col>
			<Col span="12" class="sl-change__right">
				<Form :label-width="80">
					<Form-item label="星期" class="mb-2">
						<RadioGroup v-model="right.week_day" type="button">
							<Radio v-for="(item,i) in week_map" :label="i+1">{{week_map[i]}}</Radio>
						</RadioGroup>
					</Form-item>
					<Form-item label="时段" class="mb-2">
						<select-time-section 
	                        clearable
	                        :value="right.tsArray" 
	                        @on-change="changeTimeSection($event,'right')"
	                        placeholder="请选择上课时间段">
	                    </select-time-section>
					</Form-item>
					<Form-item label="老师" class="mb-2">
						<select-employee :rid="1" v-model="right.teach_eid" clearable></select-employee>
					</Form-item>
					<div class="ivu-form-item" v-if="left.data.length" v-show="!isLoading">
						<label class="ivu-form-item-label" style="width:80px;">
							排课
							<div class="plus-area" v-per="'arrange.add'">
								<Icon type="plus-circled" @click="addCourseArrange"></Icon>
							</div>
						</label>
						<div class="ivu-form-item-content" style="margin-left:80px;">
							<div class="list-arrange">
								<div v-if="filterDataRight.length==0" style="margin-top: 4px;">没有合适的数据</div>
								<div class="item-arrange" v-for="item in filterDataRight">
									<div class="header">
										<div>
											<span style="font-size: 14px;">{{item.int_day|int_date}}</span>
											<span class="pull-right">
												周{{week_map[item.week_day-1]}}
												{{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}
											</span>
										</div>
										<div>
											<span>
												<Icon type="person"></Icon>
												{{item.teach_eid|ename}}
											</span>
											<span style="margin-left: 4px;">
												<Icon type="home"></Icon>
												{{item.cr_id|classroom_name}}
											</span>
										</div>
									</div>
									<drop 
										class="drop footer"
										:class="{allowed:isAllow(item)}"
										@drop="handleDrop($event,item)">
										<Tag 
											v-for="s in item.students" 
											type="border"
											:color="s.sid==selected.sid?'green':'default'"
											>
											{{s.student.student_name}}
										</Tag>
									</drop>
								</div>
							</div>
						</div>
					</div>
				</Form>
			</Col>
		</Row>
		<div v-if="isLoading">
			<div class="spin-container">
 				<Spin fix>正在加载排课数据...</Spin>
   			</div>
		</div>
		<div v-if="selected.sid==0">
			<Alert show-icon>
		        操作说明
		        <Icon type="ios-lightbulb-outline" slot="icon"></Icon>
		        <ul slot="desc">
		        	<li>1,先选择好日期段，确认好要调整那一段日期的排课，默认是从当前日期往后推3个月</li>
					<li>2,再选择要调整的授课对象（学员）</li>
					<li>3,选完授课对象后，系统会在左边加载授课对象在日期段内的所有排课记录,同时会在右边加载所有同一课程的其他排课记录。</li>
					<li>4,筛选排课：左边筛选原星期以及时间段、授课老师，右边筛选要调整到的日期以及时间段、授课老师.</li>
					<li>5,将左边的学员姓名用鼠标拖放到右边的日期，一个个操作即可</li>
		        </ul>
		    </Alert>
		</div>
		<div slot="footer" class="text-left">
			<div>

			</div>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectObject from 'c%/review/review-object.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectTimeSection from 'c%/SelectTimeSection'
	import SelectEmployee from 'c%/SelectEmployee'

	export default {
		mixins: [common,globals,modal],
		components: {
			SelectObject,
			DateRangePicker,
			SelectTimeSection,
			SelectEmployee
		},
		data() {
			return {
				int_day: [],
				week_map: ['一','二','三','四','五','六','日'],
				selected: {
					sid: 0,
					sl_id: 0,
					lid: 0,
					lesson_type: 0
				},
				isLoading:false,
				left: {
					data: [],
					tsArray: [],
					wee_day: 0,
					teach_eid: 0,
					int_start_hour: '',
					int_end_hour: ''
				},
				right: {
					data: [],
					tsArray: [],
					wee_day: 0,
					teach_eid: 0,
					int_start_hour: '',
					int_end_hour: ''
				}
			}
		},
		created() {
			this.initIntDay()
		},
		mounted() {

		},
		computed: {
			filterDataLeft() {
				let ret = this.left.data
				let left = util.copy(this.left)
				delete left.data
				delete left.tsArray
				function f(item) {
					let b = true
					for(let i in left) {
						if(left[i]) {
							b = b&&item.course_arrange[i]==left[i]
						}
					}
					return b
				}
				ret = ret.filter(f)
				return this.orderBy(ret,'int_day')
			},
			filterDataRight() {
				let ret = this.right.data
				let right = util.copy(this.right)
				delete right.data
				delete right.tsArray
				function f(item) {
					let b = true
					for(let i in right) {
						if(right[i]) {
							b = b&&item[i]==right[i]
						}
					}
					return b
				}
				ret = ret.filter(f)
				return this.orderBy(ret,'int_day')
			}
		},
		methods: {
			initCourseArrangeLeft() {
				return new Promise((resolve,reject) => {
					let params = {}
					params.sid = this.selected.sid
					params.lid = this.selected.lid
					params.lesson_type = this.selected.lesson_type
					params.with = 'course_arrange.course_arrange_students.student'
					params.pagesize = 1000
					params.order_field = 'int_day'
					params.order_sort = 'asc'
					if(this.int_day!=','&&this.int_day.length) {
						params.int_day = util.sprintf('[between,%s]',this.int_day.join(','))
					}
					this.$rest('course_arrange_students')
					.get(params)
					.success(res => {
						resolve(res.list)
					})
				})
			},
			initCourseArrangeRight() {
				return new Promise((resolve,reject) => {
					let params = {}
					params.lid = this.selected.lid
					params.lesson_type = this.selected.lesson_type
					params.with = 'students'
					params.pagesize = 1000
					params.order_field = 'int_day'
					params.order_sort = 'asc'
					if(this.int_day!=','&&this.int_day.length) {
						params.int_day = util.sprintf('[between,%s]',this.int_day.join(','))
					}
					this.$rest('course_arranges')
					.get(params)
					.success(res => {
						resolve(res.list)
					})
				})
				
			},
			initData() {
				this.isLoading = true
				Promise.all([this.initCourseArrangeLeft(),this.initCourseArrangeRight()])
				.then(values => {
					this.isLoading = false
					this.left.data = values[0]
					this.right.data = values[1]
				})
			},
			initIntDay() {
				let start = moment().format('YYYY-MM-DD')
				let end = moment(start).add(3,'months').format('YYYY-MM-DD')
				this.int_day = [start,end]
			},
			setTeachObject(selected) {
				let sl = selected.map_ids[selected.ids[0]]
				this.selected.sid = sl.sid
				this.selected.lid = sl.lid
				this.selected.sl_id = sl.sl_id
				this.selected.lesson_type = sl.lesson_type
				this.initData()
			},
			changeTimeSection(event,po) {
	            if(event.length) {
	                this[po].int_start_hour = this.$filter('format_int_hour')(event[0])
	                this[po].int_end_hour   = this.$filter('format_int_hour')(event[1])
	            }else{
	                this[po].int_start_hour = ''
	                this[po].int_end_hour   = ''
	            }
	        },
	        changeCourseArrange(cas_id,ca_id) {
	        	let params = {
	        		cas_ids: []
	        	}
	        	params.cas_ids.push({
	        		cas_id: cas_id,
	        		ca_id: ca_id
	        	})
	        	this.$rest('course_arrange_students/batch_change_course')
	        	.post(params)
	        	.success(res => {
	        		this.$Message.success('操作成功')
	        		this.initData()
	        	})
	        	.error(res => {
	        		this.error(res.body.message)
	        	})
	        },
	        handleDrop($event,item) {
	        	let students = item.students
	        	let find = students.find(s => s.sid == $event.cas.sid)
	        	if(find) {
	        		this.$Message.error('该学员已在排课中')
	        		return
	        	}
	        	this.changeCourseArrange($event.cas.cas_id,item.ca_id)
	        },
	        dragStart(field,data) {
	        	this.$store.commit('startDrag',{field,data})
	        },
	        dragEnd() {
	        	this.$store.commit('endDrag')
	        },
	        isAllow(item) {
	        	let field = this.$store.state.drag.field
				let data  = this.$store.state.drag.data
	        	if(field !== 'course_arrange_student') {
	        		return false
	        	}
	        	let students = item.students
	        	let find = students.find(s => s.sid == data.sid)
	        	if(find) {
	        		return false 
	        	}
	        	return true
	        },
	        refreshRightArrange(){
	        	this.isLoading = true
				Promise.all([this.initCourseArrangeRight()])
				.then(values => {
					this.isLoading = false
					this.right.data = values[0]
				})
	        },
	        addCourseArrange(){
				let fixObject = {}
				fixObject.int_day  = ''
				fixObject.lesson_type = this.selected.lesson_type
				fixObject.lid = this.selected.lid
				if(this.right.teach_eid > 0){
					fixObject.teach_eid = this.right.teach_eid
				}
				
				if(this.right.int_start_hour != '' && this.right.int_end_hour != ''){
					fixObject.ts_array = [this.right.int_start_hour,this.right.int_end_hour]
				}
				
				this.$Modal.open('business/class/arrange/info-modal.vue',{
	                on: {
	                    save: () => {
	                        this.refreshRightArrange()
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
	.sl-change__row {
		.list-arrange {
			max-height: 450px;
			overflow: auto;
			line-height: 24px;
			.item-arrange {
				margin-bottom: 15px;
				border: 1px solid #d7dde4;
				.header {
					padding: 6px;
					border-bottom: 1px solid #d7dde4;
				}
				.footer {
					padding: 6px;
				}
				.allowed {
					border:1px dashed #0c6;
				}
			}
		}
	}
</style>