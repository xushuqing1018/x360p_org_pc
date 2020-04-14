<style lang="less">
	.home-page-arrange-list {
		padding: 5px;
		.ivu-table {
			font-size: 12px;
		}
		.box {
			padding: 5px 10px;
			margin-bottom: 0;
		}
	}
</style>
<template>
    <div class="c-grid home-page-arrange-list">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
				<Form-item label="上课时间" prop="int_day" class="col-md-4 col-sm-6">
    				<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
    			</Form-item>
    			<Form-item label="班级" prop="cid" class="col-md-4 col-sm-6">
    				<select-class v-model="search_field.cid" clearable></select-class>
    			</Form-item>
    			<Form-item label="课程" prop="lid" class="col-md-4 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>    						
    			<template v-if="searchExpand">	
    				<Form-item :label="label_teacher" prop="eid" class="col-md-4 col-sm-6" v-if="is_all==1">
	    				<select-employee v-model="search_field.eid" :rid="1" clearable></select-employee>
	    			</Form-item>    
	    			<Form-item label="教室" prop="cr_id" class="col-md-4 col-sm-6">
	    				<Select v-model="search_field.cr_id">
	    					<Option :value="0">不限</Option>
	    					<Option v-for="(item,index) in classrooms" :key="index" :value="item.cr_id">{{item.room_name}}</Option>
	    				</Select>
	    			</Form-item>
	    			<Form-item label="科目" prop="sj_id" class="col-md-4 col-sm-6">
	    				<Select v-model="search_field.sj_id">
	    					<Option :value="0">不限</Option>
	    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
	    				</Select>
	    			</Form-item>	    			
    			</template>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                   </Button-group>                	
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button> 
                	<CheckboxGroup 
                		v-model="search_field.is_attendance" 
                		class="ml-3"
                		style="display: inline-block;">
                		<Checkbox :label="1" :readonly="readOnly(1,'is_attendance')">已考勤</Checkbox>
                		<Checkbox :label="0" :readonly="readOnly(0,'is_attendance')">未考勤</Checkbox>
                	</CheckboxGroup>
                	<span class="ml-2 mr-2">|</span>
                	<CheckboxGroup v-model="search_field.lesson_type" class="ml-2" style="display: inline-block;">
                		<Checkbox :label="0" :readonly="readOnly(0,'lesson_type')">班课</Checkbox>
                		<Checkbox :label="1" :readonly="readOnly(1,'lesson_type')">一对一</Checkbox>
                		<Checkbox :label="2" :readonly="readOnly(2,'lesson_type')">一对多</Checkbox>
                	</CheckboxGroup>
                	<div class="pull-right">
                        <per-scope per="arrange.checkAll" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
           </Row>	
    	</div>
    	<div class="box box-result">    		
    		<div class="content">
				<div class="content-body">
					<Table 
				        v-loading="'course_arranges'"
				        :page-size="pageSize" 
				        :page="pageIndex" 	
				        :stripe="true" 
				        :show-header="true" 
				        :data="data" 
				        :columns="columns" 
				        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
				        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
				        @on-sort-change="sortChange"> 
			        </Table>		           
	            </div>
	            <div class="content-footer">
		            <div class="pagenation">
		                <Page 
		                	size="small"
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true" 
		                	@on-change="pagenation" 
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
            </div>
    	</div>
    	<attendance-modal ref="attendance" @on-success="attendanceSuccess"></attendance-modal>
    </div>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	
	
	import AttendanceModal from './attendance/index.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			selectClass,
			selectLesson,
			selectEmployee,
			dateRangePicker,
			AttendanceModal
		},
		props: {
			searchParams: {
				type: Object,
				default: () => {
					return null
				}
			},
			noAttend: {
				type: Boolean,
				default: false
			},
			isOnline:{
				type: Number,
				default: 0
			}
		},
		data () {
			return {
				rest_api: 'course_arranges',
				pk: 'att_id',
				showIndex: false,
				type_arrange: '',
				attendance_status: {0:'待考勤',1:'部分考勤',2:'已考勤'},
				search_field: {
					class_name: '',
					lid: 0,
					sj_id: 0,
					cr_id: 0,
					cid: 0,
					eid: 0,
					second_eid: 0,
					int_day: util.week_range(),
					lesson_type: [0,1,2],
					is_attendance: [0]
				},
				column_keys: {
					teach_object: {
						title: '上课对象',
						show: true,
						width: 200
					},
					sj_id: {
						title: '科目',
						show: true
					},
					grade:{
						title:'年级',
						show:false,
						sortable:'custom'
					},
					cr_id: {
						title: '教室',
						show: true
					},
					teach_eid: {
						title: this.$filter('translate')('老师'),
						show: true,
						width: 80
					},
					int_day: {
						title: '日期',
						sortable: 'custom',
						show: true
					},
					int_hour: {
						title: '时段',
						show: true
					},
					is_attendance: {
						title: '状态',
						show: true
					},
					operation: {
						title: '操作',
						show: true,
						width: 80
					}
				},
				column_render: {
					is_attendance(h,params) {
						let elements = [],
							map_tag =  {
		                		0:{color:'default',label: '未考勤'},
		            			1:{color:'yellow',label: '部分考勤'},
		        				2:{color:'green',label: '已考勤'}
		                	},
		                	tag = map_tag[params.row.is_attendance]
						return h('Tag',{
								props: {
									color: tag.color
								}},tag.label
							)
					},
					int_hour(h,params) {
						return h('span',util.sprintf('%s~%s',this.$filter('int_hour')(params.row.int_start_hour),
							this.$filter('int_hour')(params.row.int_end_hour)))
					},
					operation(h,params) {
						return h('Button',{
								props:{
									type: 'primary',
									size: 'small',
								},
								on:{
									click:() => {
										this.attendance(params.row)
									}
								}},params.row.is_attendance==2?'查看':'考勤'
							)
					}
				}
			}
		},
		created(){
			if(!this.enable_grade){
	            delete this.column_keys['grade']
	        }
		},
		mounted() {
			if(this.noAttend) {
				let today_str = moment().format('YYYY-MM-DD');
				this.search_field.int_day = [today_str, today_str];
			}
			if(this.searchParams!==null) {
				Object.assign(this.search_field,this.searchParams)
			}
		},
		watch: {
			'type_arrange': function (val) {
				this.init_data()
			},
			isOnline(val){
				this.init_data()
			}
		},
		methods: {
			attendanceSuccess () {
				this.init_data()
				this.$emit('on-success')
			},
			perScopeChange(value) {
				this.type_arrange = value
			},
			attendance (row) {
				let class_name = this.setClassName(row),					
					title = util.sprintf('登记考勤【%s】',class_name)
					
				if(row.is_attendance===2){
					title = util.sprintf('查看考勤【%s】',class_name)
				}
				
				this.$r('attendance')
				.set('arrange',row)
				.set('ca_id',row.ca_id)
				.show(title,'add')
			},
			setClassName (item) {
				let result = ''
				
				if(item.lesson_type===0){
					if(item.is_trial===1||item.is_makeup===1){
						result = item.name
					}else{
						if(item.one_class!=null){
							result = item.one_class.class_name
						}	
					}	
				}else{
					let students = item.students
					if(students.length>0){
						students.forEach((s,i)=>{
							if(i<3){
								result += s.student.student_name+','
							}
						})
					}
					
					result = result.substring(0,result.length-1)
					
					if(students.length>3){
						result += '等'
					}
				}
							
				return result
			},
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			hook_get_param (params) {
				params.with = 'one_class,students'
				let search_obj = util.copy(this.search_field)
				
				if(this.type_arrange=='my'){
					params.teach_eid = this.eid$
				}

				params.is_cancel = 0
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='is_attendance'){
						if(property.length == 1){
	                        if(property[0] == 1) {
	                            params[o] = '[in,1,2]'
	                        }else if(property[0] == 0) {
	                            params[o] = '[in,0]'
	                        }
						}
					}else if (o=='lesson_type'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}else{					
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				if(this.isOnline == 1){
					params.is_online = 1
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.search_field.lesson_type = [0,1,2]
				this.search_field.is_attendance = [0]
				this.init_data()
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			},
			classrooms () {
	        	return this.$store.state.gvars.classrooms.filter(c=>c.bid==this.bid$)
	        }
		}
	}
</script>