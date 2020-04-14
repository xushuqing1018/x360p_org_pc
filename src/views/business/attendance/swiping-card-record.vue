<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="刷卡日期" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
    			</Form-item>
    			<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
    				<select-student v-model="search_field.sid" clearable></select-student>
    			</Form-item>
    			<Form-item label="卡号" prop="card_no" class="col-md-3 col-sm-6">
    				<Input v-model="search_field.card_no" placeholder="请输入卡号"></Input>
    			</Form-item>
    			<Form-item label="刷卡类型" prop="business_type" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.business_type">
    					<Option :value="-1">不限</Option>
    					<Option :value="0">未匹配</Option>
    					<Option :value="1">上课考勤</Option>
    					<Option :value="2">离校通知</Option>
    					<Option :value="3">到校通知</Option>
    				</Select>
    			</Form-item>    			
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                    <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  

                	<export-button res="swiping_card_records" :params="params" v-per="'swipe.export'"></export-button>                	
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
		            	v-loading.like="'student_attendances'" 
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
	import selectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			selectStudent,
			dateRangePicker,

			ExportButton,
		},
		data () {
			return {
				rest_api: 'swiping_card_records',
				pk: 'scr_id',
				search_field: {
					sid: 0,
					card_no: '',
					business_type: -1,
					int_day: []					
				},
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					card_no: {
						title: '卡号',
						show: true
					},
					business_type: {
						title: '业务类型',
						show: true
					},
					create_time: {
						title: '刷卡时间',
						show: true
					}					
				},
				column_render: {
					sid (h,params) {
						let [student,student_name] = [params.row.student,'']
						
						if(student){
							student_name = student.student_name
						}
						return h('div',[
							
							h('span',student_name)	
						])
						
					},
					business_type(h,params) {
						let map = {0:'未匹配到',1:'上课考勤',2:'离校通知',3:'到校通知'},
							result = map[params.row.business_type]						
						
						return h('div',result)
					},
					card_no(h,params){
						let result = params.row.card_no
						if(params.row.swipe_type){
							result = '扫码考勤:attendance/'+params.row.sid
						}
						return h('div',result)
					}
				}				
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {			
			hook_get_param (params) {
				params.with = 'student'
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='business_type'){
						if(property!='-1'){
							params[o] = property
						}
					}else{					
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