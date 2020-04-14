<template>
    <div>
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="考勤时间" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker v-model="search_field.int_day" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
    			</Form-item>
    			<Form-item label="来源" prop="change_type" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.change_type">
	    				<Option :value="-1">不限</Option>
	    				<Option :value="1">考勤</Option>
	    				<Option :value="2">自由登记</Option>
	    				<Option :value="3">扣款转化</Option>
	    			</Select>
    			</Form-item>
    			<Form-item label="年级" prop="grade" class="col-md-3 col-sm-6" v-if="enable_grade">
    				<Select v-model="search_field.grade">
    					<Option :value="0">不限</Option>
    					<Option :value="item.name" v-for="(item,index) in grades" :key="index">{{item.title}}</Option>
    				</Select>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<export-button res="student_lesson_hours" :params="params"></export-button>
                	<CheckboxGroup v-model="search_field.is_pay" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="1">已扣</Checkbox>
                		<Checkbox :label="0">未扣</Checkbox>
                	</CheckboxGroup>
                	<div class="pull-right">
                        <per-scope per="student.checkAll" :show-my="true" @on-change="perScopeChange"></per-scope>
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
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectLesson from 'c%/SelectLesson.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import {common_header_render} from '@/libs/grid.mixin'
	import ExportButton from 'c%/ExportButton.vue'

	export default{
		mixins: [modal,grid,common,globals],
		components: {
			selectLesson,
			dateRangePicker,
			ExportButton
		},
		props: {
			extraInfo: {
				typo: Object,
				default(){
					return {} 
				}
			}
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
						title: '学员姓名',
						show: true
					},
					course_name: {
						title: '课程/班级',
						show: true
					},
					sj_id: {
						title: '科目',
						show: true
					},
					grade:{
						title:'年级',
						sortable:'custom'
					},
					int_day: {
						title: '日期',
						sortable: 'custom',
						show: true
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
					remark: {
						title: '备注',
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
						title: this.$filter('translate')('学管师'),
						show: false
					},
					
					lesson_minutes: {
						title: '课时长(分钟)',
						show: false
					},
					
					
					operation: {
						title: '操作',
						show: true
					}
					// is_pay: {
					// 	title: '是否付款',
					// 	show: false
					// }					
				},
				column_render: {
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
						return h('span',this.$filter('employee_name')(params.row.second_e,'-'))
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
						const map = {1:'考勤课消',2:'登记课消'}
						return h('span',map[params.row.change_type])
					},
					operation(h,params) {
						let result = '-'
						
						if(params.row.is_pay == 0){
							return h('Button',{ 
								attrs: {
									title: '扣课时'
								},
								props: {
									type: 'ghost',
									shape: 'circle',
									size: 'small',
									icon: 'android-checkbox',
									title: '扣课时'
								},
								on: {
									click: ()=>{
										this.deduct(params.row)
									}
								}
							})
						}
						
						if(params.row.change_type == 2) {
							return h('Button',{
								props: {
									type: 'ghost',
									shape: 'circle',
									size: 'small',
									icon: 'ios-trash',
									title: '删除'
								},
								on: {
									click: () => {
										this.confirm(util.sprintf('确认删除【%s】的课消记录吗',params.row.student.student_name))
										.then(() => {
											this.delete(params.row)
										})
									}
								}
							})
						}
						return h('span',result)
                    },
                    consume_type_name(h,params){
                        let ret = '-'

                        if(params.row.student_lesson.order_item.consume_type_name){
                            ret = params.row.student_lesson.order_item.consume_type_name
                        }

						return h('span',ret)
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
		methods: {
			perScopeChange(value) {
	            this.$emit('on-check',value)
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
				params.with = 'student,cls'
				params.is_demo = 0
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
					}else{					
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				if(_.isEmpty(this.extraInfo)) {
					params.sid = 0
				}else{
					if(this.extraInfo.param == 'sid') {
						params.sid = this.extraInfo.id
						if(this.extraInfo.lid > 0) {
							params.lid = this.extraInfo.lid
						}
					}else{
						params.cid = this.extraInfo.id
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
		},
		watch: {
			'extraInfo':function(info) {
				console.log(info)
				this.search()
			}
		}
	}
	
</script>