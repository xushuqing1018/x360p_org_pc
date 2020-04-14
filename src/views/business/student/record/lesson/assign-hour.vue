<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="950">
		<Form :label-width="80">
			<Row :gutter="30">
				<Col span="12">
					<Form-item label="学员：" class="mb-0">
						<span>{{studentLesson.student.student_name}}</span>
					</Form-item>
					<Form-item label="课程：" class="mb-0">
						<span>{{studentLesson.lid|lesson_name}}</span>
					</Form-item>
					<Form-item label="排课进度：" class="mb-0">
						<Progress 
							:percent="arrangePercent" 
							:stroke-width="12" 
							status="active"
							>
							已排{{Number(studentLesson.arrange_hours)}} / 
							未排{{remainArrangeLessonHours}}，
							总课时{{Number(studentLesson.total_lesson_hours)}}
						</Progress>
					</Form-item>
				</Col>
				<Col span="12" class="assign-arrange__right">
					<Form-item label="日期段：" class="mb-1">
						<date-range-picker 
							v-model="search_field.int_day" 
							@on-change="init_data" 
							label="选择日期" 
							placement="bottom" 
							style="width: 100%;"
							>
						</date-range-picker>
					</Form-item>
					<Form-item label="时间段：" class="mb-1">
						<select-time-section 
                            clearable
                            :value="ts_array" 
                            @on-change="changeTimeSection"
                            placeholder="请选择上课时间段">
                        </select-time-section>
					</Form-item>
					<Form-item label="星期：" class="mb-1">
						<RadioGroup v-model="search_field.week_day" type="button" size="small">
							<Radio v-for="(item,i) in week_map" :label="i">{{week_map[i]}}</Radio>
						</RadioGroup>
					</Form-item>
					<Form-item label="老师：" class="mb-1">
						<select-employee v-model="search_field.teach_eid" :rid="1" clearable></select-employee>
					</Form-item>
				</Col>
			</Row>
		</Form>
		<div class="content-body">
	        <Table 
		        v-loading="'course_arranges'" 
		        ref="tableExcel"
		        :page-size="pageSize" 
		        :page="pageIndex" 	
		        :show-header="true" 
		        :data="data" 
		        :columns="columns" 
		        :row-class-name="rowClassName"
		        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		        @on-sort-change="sortChange"> 
	        </Table>
	    </div>
	    <div class="content-footer">
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
		            :total="total" 
		            :current="pageIndex" 
		            :show-sizer="true" 
		            :page-size="pageSize" 
		            :show-total="true" 
		            @on-change="pagenation" 
		            @on-page-size-change="pagesize"
	            >
	            </Page>
	        </div>
	    </div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectTimeSection,
			DateRangePicker,
			SelectEmployee
		},
		props: {
			studentLesson: {
				type: Object,
				default:() => {
					return {}
				}
			}
		},
		data() {
			return {
				rest_api: 'course_arranges',
				ts_array:[],
				search_field: {
					int_day: [],
					int_start_hour: '',
					int_end_hour: '',
					week_day: -1,
					teach_eid:0
				},
				week_map: ['日','一','二','三','四','五','六'],
				column_keys: {
					int_day:{
	                	title:'日期',
	                	sortable:'custom',
	                	show:true
	                },				
	                time_section:{
	                	title:'时段',
	               		show:true,
	               		width: 140
	                },
	                teach_object:{
	                    title:'授课对象',
	                    show:true,
	                    width: 250
	                },
	                teach_eid:{
	                    title:this.$filter('translate')('老师'),
	                    show:true,
	                },
	                cr_id:{
	                    title:'教室',
	                    show:true
	                },
	                op:{
	                	title:'操作',
	                	show:true,
	                	width:100
	                }
				},
				column_render: {
					teach_object(h,params){
				        let tag,
				        	row = params.row,
			                students = [],
                            sub_elements = []
			            if(row.is_trial){
			                tag = h('Tag',{
			                    props:{
			                        color:'yellow'
			                    }
			                },'试:'+row.name)
			            }else{
			                if(row.lesson_type == 1){
			                    tag = h('Tag',{
			                        props:{
			                            color:'green'
			                        }
			                    },'一')
			                }else if(row.lesson_type == 2){
			                    tag = h('Tag',{
			                        props:{
			                            color:'green'
			                        }
			                    },'多')
			                }
			            }
                        if(row.is_makeup){
                            sub_elements.push(
                                h('Tag',{
                                    props:{
                                        color:'yellow'
                                    }
                                },'补')
                            )
                        }
                        sub_elements.push(tag)

			
			            row.students.forEach(s=>{
			            	if(s.sid) {
			            		students.push(h('Tag',s.student.student_name))
			            	}
			                else if(s.cu_id && s.customer) {
			                	students.push(h('Tag',s.customer.name))
			                }
			            })

                        sub_elements.push(h('span',students))
			
			            return h('div',sub_elements)
			        },
			        op(h,params) {
			        	let btn = []
			        	let is_in = params.row._is_in
			        	if(is_in) {
			        		btn.push(h('Button',{
			        			props: {
			        				type: 'error',
			        				size: 'small'
			        			},
			        			on: {
			        				click:() => {
			        					this.quitCourseArrange(params.row)
			        				}
			        			}
			        		},'退出'))
			        	}else{
			        		btn.push(h('Button',{
			        			props: {
			        				type: 'primary',
			        				size: "small"
			        			},
			        			on: {
			        				click:() => {
			        					this.joinCourseArrange(params.row)
			        				}
			        			}
			        		},'加入'))
			        	}
			        	return h('span',btn)
			        }
				}
			}
		},
		watch: {
			
		},
		mounted() {
			this.init()
			this.init_data
		},
		computed: {
	        isFullArrange() {
	        	return Number(this.studentLesson.arrange_hours) >= Number(this.studentLesson.total_lesson_hours)
	        },
	        arrangePercent() {
	        	return Number(this.studentLesson.arrange_hours)/Number(this.studentLesson.total_lesson_hours)*100
	        },
	        remainArrangeLessonHours() {
	        	return Number(this.studentLesson.total_lesson_hours) - Number(this.studentLesson.arrange_hours)
	        }
		},
		methods: {
			init() {
				let start = moment().format('YYYY-MM-DD')
				let end = moment(start).add(6,'months').format('YYYY-MM-DD')
				this.search_field.int_day = [start,end]
			},
			hook_get_param(params) {
				let search_field = util.copy(this.search_field)
				for(let o in search_field) {
					let property = search_field[o]
					if(o=='int_day') {
						if(property!=','&&property.length) {
							params[o] = util.sprintf('[between,%s]',property.join(','))
						}
					}else{
						if(property!=-1 && property) {
							params[o] = property
						}
					}
				}
				params.is_attendance = 0
				params.lesson_type = this.studentLesson.lesson_type
				params.lid = this.studentLesson.lid
				params.with = 'students'
				params.order_field = 'int_day',
				params.order_sort = 'asc'
			},
			deal_data(data) {
				data.list.forEach(dl => {
					dl._week_day = new Date(this.$filter('int_date')(dl.int_day)).getDay()
					let index = dl.students.findIndex(s => s.sid == this.studentLesson.sid)
					if(index > -1) {
						dl._is_in = 1
					}
				})
				return data.list
			},
			quitCourseArrange(row) {
				this.$rest('course_arrange_students/delete_student')
				.post({
					ca_id: row.ca_id,
					list: [{sid:this.studentLesson.sid}]
				})
				.success(res => {
					this.$Message.success('退出成功')
					this.init_data()
					this.$emit('on-success')
					this.refreshStudentLesson()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			joinCourseArrange(row) {
				if(this.isFullArrange) {
					this.$Message.error('课时已排满')
					return
				}
				if(this.studentLesson.lesson_type==1 && row.students.length==1) {
					this.$Message.error('一对一已有学员')
					return
				}
				this.$rest('course_arrange_students')
				.post({
					ca_id: row.ca_id,
					list: [{sid:this.studentLesson.sid}]
				})
				.success(res => {
					this.$Message.success('加入成功')
					this.init_data()
					this.$emit('on-success')
					this.refreshStudentLesson()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			refreshStudentLesson() {
				this.$rest('student_lessons').add_url_param(this.studentLesson.sl_id)
				.get()
				.success(res => {
					this.studentLesson.arrange_hours = res.arrange_hours
					this.studentLesson.remain_arrange_hours = res.remain_arrange_hours
					this.studentLesson.total_lesson_hours = res.total_lesson_hours
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			rowClassName(row) {
				if(row._is_in) {
					return 'text-success'
				}
				return ''
			},
			changeTimeSection(event) {
				if(event.length) {
	                this.search_field.int_start_hour = this.$filter('format_int_hour')(event[0])
	                this.search_field.int_end_hour   = this.$filter('format_int_hour')(event[1])
	            }else{
	                this.search_field.int_start_hour = ''
	                this.search_field.int_end_hour   = ''
	            }
			}
		}
	}
</script>
<style lang="less">
	.assign-arrange__right {
		position: relative;
		&:after {
			content: ' ';
			position: absolute;
			width: 1px;
			height: 100%;
			top: 0;
			left: 0;
			background: #dddee1;
			transform: scaleX(0.5);
		}
	}
</style>