<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="850">
		<div class="c-grid">		
			<div class="box box-query">
				<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">	    			
					<Form-item label="考勤时间" prop="int_day" class="col-md-4 col-sm-6">
						<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
					</Form-item>
					<Form-item label="班级" prop="cid" class="col-md-4 col-sm-6">
						<select-class v-model="search_field.cid" clearable></select-class>
					</Form-item>
					<Form-item :label="label_teacher" prop="eid" class="col-md-4 col-sm-6">
						<select-employee v-model="search_field.eid" :rid="1" clearable></select-employee>
					</Form-item>
					<template v-if="searchExpand">	
						<Form-item label="课程" prop="lid" class="col-md-4 col-sm-6">
		    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
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
		                    <Button type="primary" @click="search" icon="ios-search">查询</Button>
		                    <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
		                </Button-group>
		            	<Button size="small" type="primary" icon="refresh" @click="resetSearch">重置</Button>
		            	<div class="pull-right">
			            	<ButtonGroup>
					            <Button 
					                :type="type_value=='my'?'primary':'ghost'" 
					                size="small" 
					                @click="type_value='my'">我的
					            </Button>
					            <Button 
					                :type="type_value=='all'?'primary':'ghost'" 
					                size="small" 
					                @click="type_value='all'">所有
					            </Button>
					        </ButtonGroup>
			            </div>
		            </Col>
		       </Row>
		   </div>
		</div>
		<div class="content">
			<div class="content-body">
	            <Table 		            	
	            	v-loading.like="'class_attendances'" 
	            	:highlight-row="true"
	            	:data="data" 
	            	:stripe="true" 
	            	:page="pageIndex" 
	            	:columns="columns" 
	            	:show-header="true" 
	            	:page-size="pageSize" 
	            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
	            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
	            	@on-sort-change="sortChange"
	            	@on-current-change="currentChange"> 
	            </Table>
	        </div>
	        <div class="content-footer">
	            <div class="pagenation text-right mt-2">
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
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [ grid,common,modal,globals ],
		components: {
			selectClass,
			selectLesson,
			selectEmployee,
			dateRangePicker
		},
		data () {
			return {
				rest_api: 'class_attendances',
				pk: 'catt_id',
				type_value: 'my',
				currentRow: {},
				search_field: {		
					lid: 0,
					sj_id: 0,
					cid: 0,
					eid: 0,
					second_eid: 0,
					lesson_type: [0,1,2],
					int_day: [],
				},
				column_keys: {
					cid: {
						title: '考勤对象',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},					
					attend_nums: {
						title: '应到/实到',
						show: true
					},				
					sj_id: {
						title: '科目',
						show: true
					},
					eid: {
						title: '上课'+this.$filter('translate')('老师'),
						show: true
					},
					second_eids: {
						title: '上课'+this.$filter('translate')('助教'),
						show: true
					},					
					int_day: {
						title: '考勤日期',
						show: true
					},						
				},
				column_render: {					
					cid (h,params) {
						let map_tag = {0:'班课',1:'一对一',2:'一对多'},
							obj_name = '',
							row = params.row
							
						if(row.lesson_type==0){
							if(row.ca_id>0&&row.course_arrange!=null){
								if(row.course_arrange.is_trial===1){
									obj_name = row.course_arrange.name	
								}
								else{
									if(row.cls!=null){
										obj_name = row.cls.class_name		
									}
								}								
							}else{
								obj_name = '班课自由考勤'
							}
						}else{
							if(params.row.student_name_list.length>0){								
								obj_name = String(params.row.student_name_list.slice(0,3).join(',')) 
							}
							if(params.row.student_name_list.length>3){
								obj_name += '等'
							}
						}
						
						return h('div',{
							'class':'pt-2 pb-2'
						},[
							// h('Tag',{
							// 	props: {
							// 		color: 'blue',
							// 		type:'border'
							// 	}
							// },map_tag[params.row.lesson_type]),
							h('span',[
								h('a',{
									attrs:{
										class: 'x-a-link text-info'
									},
									on: {
										click:() => {
											this.attendance_record(params.row)
										}
									}
								},obj_name)
							]),							
						])
						
					},
					attend_nums (h,params) {
						let result = util.sprintf('%s/%s',params.row.in_nums,params.row.need_nums)
						return h('span',result)
					},
					lesson_type (h,params) {
						let map_type = {0:'班课',1:'1对1',2:'1对多',3:'研学旅行团'}
						return h('span',map_type[params.row.lesson_type])
					},
					eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.eid))
					},
					second_eids (h,params) {
						return h('span',this.$filter('enames')(params.row.second_eids,'-'))
					},
					int_day (h,params) {
						return h('span',{
							class: {'text-success':params.row.homework_task}
						},this.$filter('int_date')(params.row.int_day))
					}					
					
				},
			}
		},
		watch: {
			'modal$.show': function (val) {
				this.currentRow = {}
			},
			type_value() {
				this.init_data()
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			currentChange (data) {
				this.currentRow = data
			},
			ok () {
				this.$emit('on-selected',this.currentRow)
				this.close()
			},
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			hook_get_param (params) {
				params.with = 'cls,course_arrange'
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='lesson_type'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}	
					}else{
						if(property){
							params[o] = property
						}
					}
				}
				if(this.type_value=='my') {
					params.eid = this.eid$
				}
			},
			attendance_record (row) {
				let title = this.setTitle(row),
					arrange = util.copy(row.course_arrange||{})
					arrange.one_class = row.cls||{}
				
				arrange.lesson_remark = row.lesson_remark
				this.$Modal.open('business/attendance/attendance/index.vue@modal?ca_id='+row.ca_id)
				.then(modal=>{
					
					modal.set('arrange',arrange)
					.set('class_attendance',row)
					.show('查看考勤【'+title+'】','record')
				})
			},
			setTitle (row) {
				let title = '',
					mapTitle = {1:'一对一',2:'一对多'}
					
				if(row.lesson_type>0){
					title = mapTitle[row.lesson_type]						
				}else{
					if(row.ca_id>0&&row.course_arrange!=null){
						if(row.course_arrange.is_trial===1){
							title = row.course_arrange.name
						}else{
							if(row.cls!=null){
								title = row.cls.class_name
							}
						}
					}else{
						title = '班课自由考勤'
					}
				}
				return title
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