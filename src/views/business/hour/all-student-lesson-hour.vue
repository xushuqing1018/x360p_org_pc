<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
    				<select-student v-model="search_field.sid" clearable></select-student>
    			</Form-item>
    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" :rid="1" :limit-per="false" clearable></select-employee>
    			</Form-item>
    			<Form-item :label="label_secteacher" prop="second_eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.second_eid" :limit-per="false" :rid="2" clearable></select-employee>
    			</Form-item>
    			<template v-if="searchExpand">
	    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
	    				<select-class v-model="search_field.cid" clearable></select-class>
	    			</Form-item>
	    			<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.sj_id">
	    					<Option :value="0">不限</Option>
	    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
	    				</Select>
	    			</Form-item>
	    			<Form-item label="考勤时间" prop="int_day" class="col-md-3 col-sm-6">
	    				<date-range-picker 
	    					v-model="search_field.int_day" 
	    					@on-change="search" 
	    					label="选择日期" 
	    					placement="bottom" 
	    					style="width:100%">
    					</date-range-picker>
	    			</Form-item>
	    			<Form-item label="课消方式" prop="change_type" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.change_type">
		    				<Option :value="-1">不限</Option>
		    				<Option :value="1">考勤</Option>
		    				<Option :value="2">自由登记</Option>
		    				<Option :value="3">扣款转化</Option>
		    			</Select>
	    			</Form-item>
	    			<Form-item label="年级" prop="grade" class="col-md-3 col-sm-6" v-if="enable_grade">
	    				<Select v-model="search_field.grade">
	    					<Option :value="-100">不限</Option>
	    					<Option :value="item.name" v-for="(item,index) in grades" :key="index">{{item.title}}</Option>
	    				</Select>
	    			</Form-item>
	    			<Form-item label="课消类型" prop="consume_type" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.consume_type">
		    				<Option :value="-1">不限</Option>
		    				<Option :value="0">正课时课消</Option>
		    				<Option :value="3">违约课消</Option>
		    			</Select>
	    			</Form-item>
	    			<Form-item label="扣课方式" prop="source_type" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.source_type">
		    				<Option :value="-1">不限</Option>
		    				<Option :value="1">从课时扣</Option>
		    				<Option :value="2">从余额扣</Option>
		    			</Select>
	    			</Form-item>
	    			<Form-item label="额外课消" prop="is_extra_consume" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.is_extra_consume">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="1">是</Option>
	    					<Option :value="0">否</Option>
	    				</Select>
	    			</Form-item>	
	    			<Form-item label="线上线下" prop="is_online" v-if="enable_online_lesson" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.is_online">
		    				<Option :value="-1">不限</Option>
	    					<Option :value="1">线上</Option>
	    					<Option :value="0">线下</Option>
	    				</Select>
	    			</Form-item>	
	    			<Form-item label="扣课课程" prop="sl_lid" class="col-md-3 col-sm-6">
	    				<select-lesson v-model="search_field.sl_lid" clearable></select-lesson>
	    			</Form-item> 
	    			<div class="col-md-6 col-sm-6">
	    				<Checkbox 
	    				:true-value="1" 
	    				:false-value="0" 
	    				v-model="search_field.diff_lid"
	    				>
	    				扣课课程与课消课程不相同
	    				</Checkbox>
		    			  	
                	</div>	
                	<Form-item label="学员封存" prop="lock_status" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.lock_status">
		    				<Option :value="-1">不限</Option>
	    					<Option :value="1">已封存</Option>
	    					<Option :value="0">未封存</Option>
	    				</Select>
	    			</Form-item>
					<Form-item label="学员年级" prop="school_grade" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.school_grade">
	    					<Option :value="0">不限</Option>
	    					<Option :value="item.name" v-for="(item,index) in grades" :key="index">{{item.title}}</Option>
	    				</Select>
	    			</Form-item>
                    <Form-item label="学管师" prop="edu_eid" class="col-md-3 col-sm-6">
						<select-employee v-model="search_field.edu_eid" :rid="4"></select-employee>
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
                	<export-button res="student_lesson_hours" :params="params"></export-button>
                	<CheckboxGroup v-model="search_field.is_pay" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="1">已扣</Checkbox>
                		<Checkbox :label="0">未扣</Checkbox>
                	</CheckboxGroup>
                	<span class="ml-2 mr-2">|</span>
                	<Checkbox class="ml-2" v-model="search_field.is_demo" :true-value="1" :false-value="0">体验课</Checkbox>
                	<span class="ml-2 mr-2">|</span>
                	<CheckboxGroup v-model="search_field.lesson_type" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="0">班课</Checkbox>
                		<Checkbox :label="1">一对一</Checkbox>
                		<Checkbox :label="2">一对多</Checkbox>
                	</CheckboxGroup>
                	<div class="pull-right">
                        <per-scope per="student.checkAll" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
           </Row>
    	</div>
    	
    	<div class="box box-result">
    		<div class="toolbar">
    			<Dropdown trigger="click" v-per="'hour.reg'">
			        <Button type="primary">
                		登记课耗
			            <Icon type="arrow-down-b"></Icon>
			        </Button>
			        <DropdownMenu slot="list">
			            <DropdownItem @click.native="addByClass">
			            	<Icon type="android-people"></Icon> 按班级登记
			            </DropdownItem>
			            <DropdownItem @click.native="addByStudent">
			            	<Icon type="android-person"></Icon> 按学员登记
			            </DropdownItem>
			        </DropdownMenu>
			    </Dropdown>
				<filter-column :keys="column_keys"></filter-column>
			</div>
    		<div class="content">
    			<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'student_lesson_hours'" 
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
	            		<Tag color="blue">总消耗课时：{{summary.sum_lesson_hours}}</Tag>	            		
	            		<Tag color="green">课时金额：{{label_currency}}{{summary.sum_lesson_amount}}</Tag>
	            		<!-- <Tag color="yellow">欠费：{{label_currency}}-{{summary.sum_lesson_amount_unpayed}}</Tag> -->
	            	</div>
		            <div class="pagenation">
		                <Page 
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true" 
							:page-size-opts="bigPageSizeOption"
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
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectStudent from 'c%/SelectStudent.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import {common_header_render} from '@/libs/grid.mixin'
	

	import ExportButton from 'c%/ExportButton.vue'

	export default{
		mixins: [modal,grid,common,globals],
		components: {
			
			selectClass,
			selectLesson,
			selectStudent,
			selectEmployee,
			dateRangePicker,
			ExportButton
		},
		data () {
			return {
				rest_api: 'student_lesson_hours',
				pk: 'slh_id',
				search_field: {
					sid: 0,
					lid: 0,
					sj_id: 0,
					cid: 0,
					eid: 0,
					second_eid: 0,
					int_day: [],
					change_type: -1,
					is_pay: [0,1],
					is_demo: 0,
					source_type: -1,
					consume_type: -1,
					lesson_type: [0,1,2],
					is_extra_consume: -1,
					is_online:-1,
					sl_lid:0,
					diff_lid:0,
					lock_status:-1,
					grade: -100,
					school_grade:-100,
                    edu_eid: 0
				},
				summary: {
					sum_lesson_amount: 0,
					sum_lesson_amount_unpayed: 0,
					sum_lesson_hours: 0
				},
				column_keys: {
					bid:{
						title:'校区',
						show:false
					},
					pj_id:{
						title:'项目',
						show: false
					},
					sid: {
						title: '学员',
						show: true
					},
					course_name: {
						title: '课程/班级',
						show: true
					},
					edu_eid:{
                        title:this.$filter('translate')('学管师'),
                        show:false
                    },
					sj_id: {
						title: '科目',
						show: true
					},
					cr_id: {
						title: '教室',
						show: false
					},
					grade:{
						title:'年级',
						sortable:'custom',
						show: false
					},
					int_day: {
						title: '日期',
						sortable: 'custom',
						show: true
					},
					source_type:{
						title:'扣课方式',
						show:true
					},
					sl_lid:{
						title:'扣课课程',
						show:false
					},
					lesson_hours: {
						title: '课时数',
						show: true
                    },
                    consume_type_name: {
						title: '收费类型',
						show: true
					},
					is_pay: {
						title: '课消状态',
						show: true
					},
					lesson_amount: {
						title: '课消金额',
						show: true
					},
					change_type: {
						title: '课消方式',
						show: true
					},
					is_online:{
	                    title:'线上课',
	                    show:false
	                },
					remark: {
						title: '备注',
						show: false
					},
					consume_type:{
						title:'课消类型',
						show:true
					},
					is_extra_consume: {
						title:'额外课消',
						show: false
					},
					description:{
						title:'课消说明',
						show:true
					},
					cid: {
						title: '班级',
						show: false
					},
					lesson_type: {
						title: '课程类型',
						show: false
					},
					
					time_section: {
						title: '考勤时段',
						show: false
					},
					eid: {
						title: this.$filter('translate')('老师'),
						show: false
					},
					second_eid: {
						title: this.$filter('translate')('助教'),
						show: false
					},
					lesson_minutes: {
						title: '课时长(分钟)',
						show: false
					}
				},
				column_render: {
					consume_type(h,params){
						let map = {
							0:'正课时课消',
							1:'副课时课消',
							2:'缺课课消',
							3:'违约课消'
						}
						let text = map[params.row.consume_type]
						return h('span',text)
					},
					source_type(h,params){
						let text = '扣课时'
						if(params.row.source_type == 2){
							text = '扣余额'
						}
						return h('span',text)
					},
					lesson_hours(h,params) {
						if(params.row.source_type == 2){
							return h('span','-')
						}
						return h('span',params.row.lesson_hours)
					},
					description(h,params){
						let spans=[]
						if(params.row.change_type == 1){	//考勤课消
							spans.push(h('span','考勤课消:'))
							spans.push(common_header_render.time_section.call(this,h,params))
							spans.push(h('span','/'))
							spans.push(this.column_render.cid.call(this,h,params))
							spans.push(h('span','/'))
							spans.push(this.column_render.eid.call(this,h,params))
						}else if(params.row.change_type == 2){
							spans.push(h('span','登记课消'))
							if(params.row.remark != ''){
								spans.push(h('span',':'+params.row.remark))
							}
							
						}else{
							spans.push(h('span','扣款转化'))
						}
						return h('span',spans)
					},
					sid (h,params) {
						let [student,student_name] = [params.row.student,''] 
						let child = []
						if(student){
							student_name = student.student_name
							child.push(h('span',student_name))
							if(student.status == 100){
								child.push(h('p','[已封存]'))
							}
							if(this.enable_grade && student.school_grade != '-'){
								child.push(h('p','年级:'+student.school_grade))
                            }
                            if(student.sno != ''){
								child.push(h('p','学号:'+student.sno))
							}
						}
						return h('div',child)
					},
					cid (h,params) {
						let result = '-'
						if(params.row.lesson_type===0&&params.row.cid>0){
							result = params.row.cls.class_name
						}
						return h('span',result)
					},
					eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.eid,'-'))
					},
					second_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.second_eid,'-'))
					},
					edu_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.edu_eid,'-'))
					},
					lesson_type (h,params) {
						let map_type = {0:'班课',1:'1对1',2:'1对多',3:'研学旅行团'}
						return h('span',map_type[params.row.lesson_type])
					},
					is_pay (h,params) {
						let map = {0:'未扣',1:'已扣'}
						return h('span',{							
							'class': params.row.is_pay===1?'text-success':'text-danger'							
						},map[params.row.is_pay])
						
					},
					lesson_amount(h,params){
						return h('span',this.$filter('format_lesson_amount')(params.row.lesson_amount))
					},
					change_type(h,params) {
						const map = {1:'考勤',2:'自由登记',3:'扣款转化'}
						return h('span',map[params.row.change_type])
					},
					is_extra_consume(h,params) {
						if(params.row.is_extra_consume) {
							return h('span',this.$filter('dict_title')(params.row.extra_consume_did,'extra_consume'))
						}else{
							return h('span','无')
						}
					},
					is_online(h,params){
	                    let t = '否'
	                    if(params.row.is_online == 1){
	                        t = '是'
	                    }
	                    return h('span',t)
	                },
	                sl_lid(h,params){
	                	let result = '-'
						if(params.row.student_lesson.lid>0){
							result = this.$filter('lesson_name')(params.row.student_lesson.lid,'-')
						}
						return h('span',{
							'class': params.row.lid==params.row.student_lesson.lid?'':'text-danger'	
						},result)
                    },
                    consume_type_name(h,params){
                        let ret = '-'

                        if(params.row.student_lesson.order_item.consume_type_name){
                            ret = params.row.student_lesson.order_item.consume_type_name
                        }

						return h('span',ret)
					}
				},
				operation_keys: {
					correct: {
						title: '修正扣课课时',
						type: 'edit',
						per: 'hour.correct',
						condition: 'row.change_type==1&&row.source_type==1&&row.sl_id>0'
					},
					deduct: {
						title: '扣课时',
						type: 'android-checkbox',
						per: 'hour.deduct',
						condition: 'row.is_pay==0'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'hour.delete',
						condition: 'row.change_type==2'
					}
				},
				operation_func: {
					correct(params) {
						this.correct(params.row)
					},
					deduct(params) {
						this.deduct(params.row)
					},
					delete(params) {
						this.confirm(util.sprintf('确认删除【%s】的课消记录吗',params.row.student.student_name))
						.then(() => {
							this.delete(params.row)
						})
					}
				}
			}
		},
		created(){
			if(!this.enable_grade){
	            delete this.column_keys['grade']
	        }
	        if(!this.enable_online_lesson){
	            delete this.column_keys['is_online']
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
	            this.$emit('on-check',value)
	        },
	        correct (row) {
	        	this.$Modal.open('business/hour/correct-lesson-hour.vue@modal',{
	        		props: {
	        			info: row
	        		},
	        		on: {
	        			'on-success':() => {
	        				this.init_data()
	        			}
	        		}
	        	})
	        	.then(modal => {
	        		modal.show(util.sprintf('修正扣课课时【%s】',row.student?row.student.student_name:'-'))
	        	})
	        },
			deduct (row) {
				this.$Modal.open('business/hour/deduct-modal.vue',{
	        		on: {
	        			'on-success':() => {
	        				this.init_data()
	        			}
	        		}
	        	})
	        	.then(modal => {
	        		modal
	        		.set('sid',row.sid)
	        		.set('slh_id',row.slh_id)
	        		.set('sj_id',row.sj_id)
	        		modal.show(util.sprintf('手动扣除【%s】的课时',row.student?row.student.student_name:'-'))
	        	})
			},
			hook_get_param (params) {
				params.with = 'student,cls,student_lesson'
				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='is_pay'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}else if(o=='is_demo'){
						params[o] = property
					}else if(o=='consume_type'){
						if(property != '-1'){
							params[o] = property
						}
					}else if(o=='lesson_type'){
						if(property.length > 0){
							params[o] = `[In,${property.join(',')}]`
						}
					}else if(o=='is_extra_consume'){
						if(property != '-1'){
							params[o] = property
						}
					}else if(o=='sl_lid'){
						if(property > 0){
							params[o] = property
						}
					}else if(o=='diff_lid'){
						if(property){
							params[o] = 1
						}
					}else if(o == 'lock_status'){
						if(property != '-1'){
							params[o] = property
						}
					}else if(o == 'school_grade' || o == 'grade'){
						if(property != '-100'){
							params[o] = property
						}
					}else{					
						if(property && property!='-1'){
							params[o] = property
						}
					}
				}
			},
			deal_data(data) {
				this.summary.sum_lesson_amount = data.sum_lesson_amount
				this.summary.sum_lesson_amount_unpayed = data.sum_lesson_amount_unpayed
				this.summary.sum_lesson_hours = data.sum_lesson_hours
				
				return data.list
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.search_field.is_pay = [0,1]
			},
			addByStudent () {
				this.$Modal.open('business/hour/info-modal-student.vue@modal',{
	        		on: {
	        			'on-success':() => {
	        				this.init_data()
	        			},
	        			'on-class':()=>{
	        				this.addByClass()
	        			}
	        		}
	        	})
	        	.then(modal => {
	        		modal.show('按学员登记')
	        	})
			},
			addByClass() {
				this.$Modal.open('business/hour/info-modal-class.vue@modal',{
	        		on: {
	        			'on-success':() => {
	        				this.init_data()
	        			},
	        			'on-student':()=>{
	        				this.addByStudent()
	        			}
	        		}
	        	})
	        	.then(modal => {
	        		modal.show('按班级登记')
	        	})
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			}
		}
	}
	
</script>