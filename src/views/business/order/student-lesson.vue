<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-sm-6 col-md-3">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="课程" prop="lid" class="col-sm-6 col-md-3">
					<select-lesson v-model="search_field.lid" clearable></select-lesson>
				</Form-item>
				<Form-item label="科目" prop="sj_id" class="col-sm-6 col-md-3">
					<select-subject v-model="search_field.sj_id" clearable></select-subject>
				</Form-item>
				<Form-item label="班级" prop="cid" class="col-sm-6 col-md-3">
					<select-class v-model="search_field.cid" clearable></select-class>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="到期时间" prop="expire_time" class="col-sm-6 col-md-3">
						<date-range-picker 
							v-model="search_field.expire_time" 
							@on-change="search" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>
					</Form-item>
					<Form-item label="到期时段" prop="expire_condition" class="col-sm-6 col-md-3">
						<Select v-model="search_field.expire_condition">
							<Option v-for="(item,index) in expire_condition" :value="item.field" :key="index">{{item.label}}</Option>
						</Select>
					</Form-item>
					<Form-item label="剩余课时" prop="remain_lesson_hours" class="col-md-3 col-sm-6">
						<select-age v-model="search_field.remain_lesson_hours"></select-age>
					</Form-item>
					<Form-item label="排课状态" prop="arrange_status" class="col-md-3 col-sm-6" v-if="enable_arrange_status">
						<Select v-model="search_field.arrange_status">
							<Option :value="-1">不限</Option>
							<Option :value="2">已排满</Option>
							<Option :value="1">未排满</Option>
							<Option :value="0">未排课</Option>
						</Select>
					</Form-item>
					<Form-item label="计费模式" prop="price_type" class="col-md-3 col-sm-6">
						<Select v-model="search_field.price_type">
							<Option :value="-1">不限</Option>
							<Option :value="item.value" v-for="(item,index) in price_types">{{item.label}}</Option>
						</Select>
					</Form-item>
				</template>
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<export-button res="student_lessons" :params="params"></export-button>
                	<CheckboxGroup v-model="search_field.lesson_status" class="ml-2" style="display: inline-block;">
                   		<Checkbox :label="1" :readonly="readOnly(1,'lesson_status')">正常</Checkbox>
                   		<Checkbox :label="0" :readonly="readOnly(0,'lesson_status')">结课</Checkbox>
                   	</CheckboxGroup>
                	<ButtonGroup class="ml-4">
	                	<Button type="ghost" @click="checkImportHistory">导入记录</Button>
	                	<Button type="ghost" @click="checkPresentHistory">赠送记录</Button>
	                	<Button type="ghost" @click="checkTransferHoursHistory">转让记录</Button>
	                	<Button type="ghost" @click="checkTransferHistory">结转记录</Button>
	                </ButtonGroup>
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<import-button res="student_lessons" name="课时" @on-import-finish="init_data" v-per="'hours.import'"></import-button>
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
				<div class="content-body">
			        <Table 
			        v-loading="'student_lessons'" 
			        ref="tableExcel"
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
			            <Page :total="total" 
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
		    </div>
	    </div>
	   
    </div>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectSubject from 'c%/SelectSubject.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import ImportButton from 'c%/ImportButton.vue'
	import SelectAge from 'c%/SelectAge.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	const STYLE = {fontSize:'12px',lineHeight:'22px'}
	export default{
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectStudent,
			SelectLesson,
			SelectClass,
			SelectSubject,
			ImportButton,
			ExportButton,
			SelectAge
		},
		data () {
			return {
				rest_api: 'student_lessons',
				pk: 'sj_id',
				search_field: {
					sid: 0,
					lid: [],
					cid: [],
					sj_id: 0,
					ac_status: -1,
					price_type:-1,
					expire_time: [],
					remain_lesson_hours: [0,0],
					lesson_status: [0,1],
					expire_condition: '',
					arrange_status: -1
				},
				ac_status: [
					{value:0,label:'未分班',color:'text-danger'},
					{value:1,label:'部分分班',color:'text-info'},
					{value:2,label:'已分班',color:'text-success'}
				],
				price_types:[
				{value:2,label:'按课时'},
				{value:3,label:'按月'}
				],
				column_keys: {
					sid: {
						title: '学员/校区',
						show: true
					},
					pj_id:{
						title: '项目',
						show: false
					},
					lid: {
						title: '课程',
						show: true
					},
					sj_ids: {
						title: '科目',
						show: true
					},
					class_name: {
						title: '班级',
						show: true
					},
					teacher: {
						title: '上课老师',
						show: false
					},
					teacher_level:{
						title: '教师星级',
						show:true
					},
					lesson_type: {
						title: '课程类型',
						show: false
					},
					arrange_hours: {
						title: '已排课时/总课时',
						show:true
					},
					lesson_hours: {
						title: '剩余课时/总课时',
						show: true,
						sortable:'custom'
					},
					remain_lesson_hours:{
						title:'剩余课时',
						show:false,
						sortable:'custom'
					},
					origin_and_present: {
						title: '导入/赠送',
						show: true
					},
					in_and_out: {
						title: '转入/转出',
						show: false
					},
					consume: {
						title: '结转/退费',
						show: true
					},
					expire_time_text: {
						title: '有效期',
						show: true
					},
					is_package: {
						title: '课时包',
						show: false
					},
					lesson_status: {
						title: '课程状态',
						show: true
					},
					is_stop: {
						title: '是否停课',
						show: false
					},
					last_attendance_time: {
						title: '最后考勤时间',
						sortable: 'custom',
						show: false
					},
					ac_status: {
						title: '分班状态',
						show: false
					}	
				},
				column_render: {
					teacher (h,params) {
						return h('span',this.$filter('ename')(params.row.eid,'-'))
					},
					sid (h,params) {
						let student_name = params.row.student.student_name,
							branch = this.$filter('branch_name')(params.row.bid)
						return h('span',util.sprintf('%s (%s)',student_name,branch))
					},
					class_name(h,params) {
						let name = '-'
						if(params.row.one_class) {
							name = params.row.one_class.class_name
						}
						return h('span',name)
					},
					lesson_hours(h,params) {
						let row = params.row,
							percent = 0,

							label = util.sprintf('%s/%s',Number(row.remain_lesson_hours),Number(row.total_lesson_hours))
							if(row.price_type == 3){
								return h('span','-')
							}else{
								if(row.lesson_hours>0){
									percent = parseFloat(row.remain_lesson_hours/row.total_lesson_hours).toFixed(2)*100
								}
								return h('Progress',{
									props: {
										percent:percent
									}
								},label)
							}
						
					},
					arrange_hours(h,params) {
						let row = params.row,
							percent = 0,

							label = util.sprintf('%s/%s',Number(row.arrange_hours),Number(row.total_lesson_hours))
							if(row.price_type == 3){
								return h('span','-')
							}else{
								if(row.lesson_hours>0){
									percent = parseFloat(row.arrange_hours/row.total_lesson_hours).toFixed(2)*100
								}
								return h('Progress',{
									props: {
										percent:percent
									}
								},label)
							}
						
					},
					lesson_type (h,params) {
						return h('span',this.$filter('lesson_type')(params.row.lesson_type))
					},
					origin_and_present(h,params) {
						let origin = h('p','导入：'+params.row.import_lesson_hours),
                    		present = h('p','赠送：'+params.row.present_lesson_hours),
                    		empty   = h('p','-'),
                    		child = []

                    		if(params.row.price_type == 3){
                    			child.push(empty)
                    		}else{
                    			child.push(origin)
                    			child.push(present)
                    		}

                		return h('div',{
                			style:STYLE
                		},child) 
					},
					in_and_out(h,params) {
						let inhour = h('p','转入：'+params.row.trans_in_lesson_hours),
                    		outhour = h('p','转出：'+params.row.trans_out_lesson_hours),
                    		empty   = h('p','-'),
                    		child = []

                    		if(params.row.price_type == 3){
                    			child.push(empty)
                    		}else{
                    			child.push(inhour)
                    			child.push(outhour)
                    		}
                		return h('div',{
                			style:STYLE
                		},child) 
					},
					consume(h,params) {
                		let transfer = h('p','结转：'+params.row.transfer_lesson_hours),
                    		refund = h('p','退费：'+params.row.refund_lesson_hours),
                    		empty   = h('p','-'),
                    		child = []

                    		if(params.row.price_type == 3){
                    			child.push(empty)
                    		}else{
                    			child.push(transfer)
                    			child.push(refund)
                    		}
                		return h('div',{
                			style:STYLE
                		},child)
                    },
					ac_status (h,params) {
						let status_obj = this.ac_status.find(item=>item.value==params.row.ac_status)
						return h('span',{
							attrs: {
								class: status_obj.color
							}
						},status_obj.label)
					},
					lesson_status(h,params) {
                        return h('span',this.$filter('lesson_status_text')(params.row.lesson_status))
                    },
                    is_stop(h,params) {
                    	return h('span',params.row.is_stop == 1 ? '是':'否')
                    },
                    is_package(h,params) {
                    	return h('span',params.row.is_package == 1? '是':'否')
                    },
                    last_attendance_time(h,params) {
                    	let last = params.row.last_attendance_time
                    	return h('span',last?last:'-')
                    },
                    expire_time_text(h,params) {
                    	let expire_time = params.row.expire_time
                    	let text = params.row.expire_time_text
                    	if(expire_time === 0) {
                    		return h('span',params.row.expire_time_text)
                    	}else{
                    		let label = h('span',{
                    			style:{
                    				color:text === '正常'?'#006600':'#c90808'
                    			}
                    		},text)
                    		return h('div',[label,`(${expire_time})`])
                    	}
                    }
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'hours.edit'
					},
					present: {
						title: '赠送课时',
						type: 'plus',
						per: 'hours.present'
					},
					assign: {
						title: '按课时排课',
						type: 'share',
						per: 'hours.assign',
						condition: 'row.lesson_type!=0&&1=='+this.$store.state.gvars.configs.params.course_arrange.allow_empty_teachobj
					},
					teacher: {
						title: '安排上课老师',
						type: 'university',
						per: 'hours.university',
						condition: 'row.lesson_type!=0'
					},
					transfer: {
						title: '课时结转',
						type: 'minus',
						condition: "row.import_lesson_hours!=0",
						per: 'hours.transfer'
					}
				},
				operation_func: {
					edit(params) {
						this.editStudentLesson(params.row)
					},
					teacher(params) {
						this.$Modal.open('business/order/student-lesson/teacher-modal.vue',{
							props: {
								'info': params.row
							},
							on: {
								'on-success':() => {
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal.show(util.sprintf('安排上课老师【%s】',params.row.student.student_name))
						})
					},
					present(params) {
						this.presentHours(params.row)
					},
					transfer(params) {
						this.transferHours(params.row)
					},
					assign(params) {
						this.assignHour(params.row)
					}
				}
			}
		},
		created(){
			if(!this.enable_arrange_status) {
				delete this.column_keys['arrange_hours']
			}
			if(!this.enable_teacher_level){
	            delete this.column_keys['teacher_level']
	        }
	        if(!this.enable_project){
	        	delete this.column_keys['pj_id']
	        }
		},
		mounted () {
			this.init_data()
		},
		methods: {
			assignHour (item) {
				this.$Modal.open('business/student/record/lesson/assign-hour.vue@modal',{
					props: {
						'student-lesson': item
					},
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('按课时排课')
				})
			},
			checkTransferHistory() {
				this.$Modal.open('business/order/student-lesson/transfer.vue@modal',{
					on:{
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('课时结转记录')
				})
			},
			checkTransferHoursHistory() {
				this.$Modal.open('business/order/student-lesson/transfer-record.vue@modal',{
					on:{
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show()
				})
			},
			checkImportHistory() {
				this.$Modal.open('business/order/student-lesson/import-record-modal.vue',{
					on:{
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('课时导入记录','list')
				})
			},
			checkPresentHistory() {
				this.$Modal.open('business/order/student-lesson/present-record-modal.vue',{
					on:{
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('课时赠送记录','list')
				})
			},
			editStudentLesson (item) {
				this.$Modal.open('business/student/record/lesson-operate.vue@modal',{
					props: {
						'sl-id': item.sl_id
					},
					on: {
						'on-success':() =>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					let title = item.lid?this.$filter('lesson_name')(item.lid,'-'):this.$filter('subject_name')(item.sj_id,'-')
					modal
					.set('info',item)
					.set('lessonEnd',item.lesson_status==2)
					.set('sl_id',item.sl_id)
					modal.show(util.sprintf('【%s】编辑可用科目及有效期',title))
				})
			},
			presentHours(row) {
				let info = util.copy(row)
				this.$Modal.open('business/order/student-lesson/present-modal.vue',{
					on: {
						save:()=>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.vuec
					.set('info',info)
					.show('赠送课时','edit')	
				})
			},
			transferHours(row) {
				let info = util.copy(row)
				this.$Modal.open('business/order/student-lesson/transfer-modal.vue',{
					on: {
						save:()=>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.vuec
					.set('info',info)
					.show('结转课时','edit')	
				})
			},
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			resetSearch () {
				this.$form('ref_search').reset()
			},
			hook_get_param (params) {
				params.with = 'student,one_class'
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='expire_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='sj_id'&&property>0){
						params['sj_ids'] = util.sprintf('[in,%s]',property)							
					}else if(o=='remain_lesson_hours') {
						let start = util.int(property[0])
						let end = util.int(property[1])
						if(start>=0&&end>0&&end>=start){
							params[o] = util.sprintf('[Between,%s,%s]',start,end)
						}						
					}else if(o=='lesson_status'){
						if(property.length == 1){
	                        if(property[0] == 1) {
	                            params[o] = '[in,1,0]'
	                        }else if(property[0] == 0) {
	                            params[o] = 2
	                        }
						}						
					}else if(o=='arrange_status'){
						if(property!==-1) {
							params[o] = property
						}

					}else if(o=='cid' || o=='lid'){
						if(property.length == 1){
							params[o] = property[0]
						}else if(property.length > 1){
							params[o] = '[In,'+property.join(',')+']'
						}
					}else{					
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				} 
			}
		}
	}
</script>
