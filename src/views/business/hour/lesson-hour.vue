<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>
    			<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.sj_id">
    					<Option :value="0">不限</Option>
    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
    				</Select>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" :rid="1" :limit-per="false" clearable></select-employee>
    			</Form-item>
    			<Form-item :label="label_secteacher" prop="second_eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.second_eid" :rid="2" :limit-per="false" clearable></select-employee>
    			</Form-item>
    			<template v-if="searchExpand">
	    			<Form-item label="考勤时间" prop="int_day" class="col-md-3 col-sm-6">
	    				<date-range-picker 
	    					v-model="search_field.int_day" 
	    					@on-change="search" 
	    					label="选择日期" 
	    					placement="bottom" 
	    					style="width:100%">
						</date-range-picker>
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
                	<export-button res="lesson_hours" :params="params"></export-button>
                	<Checkbox class="ml-2" v-model="search_field.is_demo" :true-value="1" :false-value="0">体验课</Checkbox>
                	<span class="ml-2 mr-2">|</span>
                	<CheckboxGroup v-model="search_field.lesson_type" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="0">班课</Checkbox>
                		<Checkbox :label="1">一对一</Checkbox>
                		<Checkbox :label="2">一对多</Checkbox>
                	</CheckboxGroup>
                </Col>
           </Row>
    	</div>
    	
    	<div class="box box-result">
    		<div class="toolbar">	
				<filter-column :keys="column_keys"></filter-column>
			</div>
    		<div class="content">
    			<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'employee_lesson_hours'" 
		            	ref="tableExcel"
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"> 
		            </Table>
	            </div>
	            <div class="content-footer">
	            	<div class="pull-left">
	            		<Tag color="blue">总消耗课时：{{summary.sum_total_lesson_hours}}</Tag>
	            		<Tag color="green">课时总金额：{{label_currency}}{{summary.sum_total_lesson_amount}}</Tag>
	            		<!-- <Tag color="green">已付款：{{label_currency}}{{summary.sum_payed_lesson_amount}}</Tag>
	            		<Tag color="yellow">欠费：{{label_currency}}-{{summary.sum_unpayed_lesson_amount}}</Tag> -->
	            	</div>
		            <div class="pagenation">
		                <Page 
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
    </div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'

	import ExportButton from 'c%/ExportButton.vue'
	export default{
		mixins: [grid,common,globals],
		components: {
			selectClass,
			selectLesson,
			selectEmployee,
			dateRangePicker,

			ExportButton
		},
		data () {
			return {
				rest_api: 'employee_lesson_hours',
				pk: 'elh_id',
				search_field: {
					lid: 0,
					sj_id: 0,
					eid: 0,
					second_eid: 0,
					int_day: [],
					is_demo: 0,
					lesson_type: [0,1,2]
				},
				type_hour: '',
				summary: {
					sum_payed_lesson_amount: 0,
					sum_total_lesson_amount: 0,
					sum_total_lesson_hours: 0,
					sum_unpayed_lesson_amount: 0
				},
				column_keys: {
					bid:{
						title:'校区',
						show:true,
						sortable:'custom'
					},
					pj_id:{
						title:'项目',
						show:false
					},
					lid: {
						title: '课程',
						show: true
					},
					sj_id: {
						title: '科目',
						show: true
					},
					object_name: {
						title: '授课对象',
						show: true
					},
					eid: {
						title: this.$filter('translate')('老师'),
						show: true
					},
					second_eid: {
						title: this.$filter('translate')('助教'),
						show: false
					},
					edu_eid: {
						title: this.$filter('translate')('学管师'),
						show: false
					},
					lesson_type: {
						title: '课程类型',
						show: false
					},
					grade:{
						title:'年级',
						sortable:'custom'
					},	
					student_nums: {
						title: '扣费人数',
						show: true
					},
					absence_nums: {
						title: '缺勤扣费人数',
						show: false
					},
					int_day: {
						title: '考勤日期',
						sortable: 'custom',
						show: true
					},
					time_section: {
						title: '考勤时段',
						show: true
					},
					lesson_hours: {
						title: '课时数',
						show: true
					},
					total_lesson_hours: {
						title: '总课时数',
						show: true
					},
					total_lesson_amount: {
						title: '总课时金额',
						show: true
					}									
				},
				column_render: {
					object_name (h,params) {
						let result = ''
						if(params.row.lesson_type==0) {
							if(params.row.cid > 0){
								result = params.row.class_name
							}else if(params.row.is_makeup == 1){
								result = '【补课】'
							}
						}
						if(params.row.student_name_list.length > 0){
							result += params.row.student_name_list.join(',')
						}
						return h('span',result)
					},
					edu_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.edu_eid,'-'))
					},
					eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.eid,'-'))
					},
					second_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.second_eid,'-'))
					},
					lesson_type (h,params) {
						let map_type = {0:'班课',1:'1对1',2:'1对多',3:'研学旅行团'}
						return h('span',map_type[params.row.lesson_type])
					},
					lesson_hours (h,params) {
						let hour = params.row.lesson_hours,
						minutes = params.row.lesson_minutes
						return h('span',util.sprintf('%s 课时（%s分钟）',hour,minutes))
					},
					total_lesson_amount(h,params){
						return h('span',this.$filter('format_lesson_amount')(params.row.total_lesson_amount))					
					}
				}
			}
		},
		created(){
			if(!this.enable_grade){
	            delete this.column_keys['grade']
	        }
	        if(!this.enable_project){
	        	delete this.column_keys['pj_id']
	        }
		},
		mounted() {
			this.init_data()
		},
		methods: {
			perScopeChange(value) {
	            this.type_hour = value
	        },
			deal_data (data) {
				this.summary.sum_payed_lesson_amount = data.sum_payed_lesson_amount
				this.summary.sum_total_lesson_amount = data.sum_total_lesson_amount
				this.summary.sum_total_lesson_hours = data.sum_total_lesson_hours
				this.summary.sum_unpayed_lesson_amount = data.sum_unpayed_lesson_amount
				return data.list
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='is_demo'){
						params[o] = property
					}else if(o=='lid'){
						if(property>0) {
							params[o] = property
						}else{
							params[o] = '[>,0]'
						}
					}
					else if(o=='lesson_type'){
						if(property.length > 0){
							params[o] = `[In,${property.join(',')}]`
						}
					}
					else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			}
		}
	}
	
</script>