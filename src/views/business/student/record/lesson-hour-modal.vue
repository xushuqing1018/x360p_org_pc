<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="900" :mask-closable="false">
		<div class="c-grid p-0">
			<div class="box box-result">
				<div class="toolbar">
					<export-button res="student_lesson_hours" :params="params"></export-button>
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
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	import {common_header_render} from '@/libs/grid.mixin'
	
	export default{
		mixins: [ grid,common,modal,globals ],
		props: {
			slId: {
				type:Number,
				default:0	
			}
		},
		components: {
			ExportButton
		},
		data () {
			return {
				rest_api: 'student_lesson_hours',
				pk: 'slh_id',
				summary: {
					sum_lesson_amount: 0,
					sum_lesson_amount_unpayed: 0,
					sum_lesson_hours: 0
				},
				showIndex: false,
				column_keys: {
					bid:{
						title:'校区',
						fixd: 'left',
						show:false,
					},
					sid: {
						title: '学员',
						fixd: 'left',
						show: true,
					},
					course_name: {
						title: '课程/班级',
						show: true,
					},
					sj_id: {
						title: '科目',
						show: true,
					},
					sl_lid:{
						title:'扣课课程',
						show:false,
					},
					lesson_hours: {
						title: '课时数',
						show: true,
					},
					is_pay: {
						title: '课消状态',
						show: true,
					},
					lesson_amount: {
						title: '课消金额',
						show: true,
					},
					description:{
						title:'课消说明',
						show:true,
						width: 200
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
							spans.push(this.$filter('int_date')(params.row.int_day))
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
						if(student){
							student_name = student.student_name
						}
						return h('span',student_name)
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
	                }
				},
				operation_keys: {
					correct: {
						title: '修正扣课课时',
						type: 'edit',
						per: 'hour.correct',
						condition: 'row.change_type==1&&row.source_type==1'
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
				let title = util.sprintf('手动扣除【%s】的课时',row.student.student_name)
				
				this.$r('ref_info_d')
				.set('sid',row.sid)
				.set('slh_id',row.slh_id)
				.set('sj_id',row.sj_id)
				.show(title,'add')
			},
			deal_data(data) {
				this.summary.sum_lesson_amount = data.sum_lesson_amount
				this.summary.sum_lesson_amount_unpayed = data.sum_lesson_amount_unpayed
				this.summary.sum_lesson_hours = data.sum_lesson_hours
				
				return data.list
			},
			hook_get_param(params) {
				params.sl_id = this.slId
				params.with = 'student,cls,student_lesson'
			}
		}
	}
	
</script>

<style>
</style>