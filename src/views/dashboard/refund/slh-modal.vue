<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="1200" :mask-closable="false">
         <div class="box box-result">
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
		            <div class="pagenation m-t">
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
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import grid 		from '@/libs/grid.mixin'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import modal 		from '@/libs/modal.mixin'
    import {common_header_render} from '@/libs/grid.mixin'
    
    export default{
		mixins: [modal,grid,common,globals],	
		data () {
			return {
				rest_api: 'student_lesson_hours',
				pk: 'slh_id',
				search_field:{
					sl_id:0,
					int_month:''
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
					sid: {
						title: '学员',
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
					lesson_hours: {
						title: '课时数',
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
					refund_amount:{
						title: '退返金额',
						show:true
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
		methods: {
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
			setParams(sl_id,int_month){
				this.search_field.sl_id = sl_id
				this.search_field.int_month = int_month
				this.init_data()
				return this
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			}
		}
	}
</script>