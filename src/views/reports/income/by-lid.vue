<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="时间段" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker 
						:value="search_field.int_day" 
						@on-change="search_field.int_day=$event" 
						:clearable="false"
						label="请选择时间段" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>
    			</Form-item>
    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable placeholder="请选择课程"></select-lesson>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<export-button res="report_employee_outputs" :params="params"></export-button>            	
                </Col>
            </Row>
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<filter-column :keys="column_keys"></filter-column>
			</div>
	        <div class="content">
                <div class="content-body">

                    <div class="ivu-table-wrapper" v-loading.like="'report_employee_outputs'">
                    	<table class="modal-table receipt-summary">
                    		<thead>
                    			<tr>
                    				<th><div class="ivu-table-cell">课程</div></th>
                    				<th><div class="ivu-table-cell">课时数</div></th>
                    				<th><div class="ivu-table-cell">学员人次</div></th>
                    				<th><div class="ivu-table-cell">课时金额</div></th>
                    			</tr>
                    		</thead>

                    		<tbody>
                    			<tr v-for="item in data">
                    				<td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
                    				<td><div class="ivu-table-cell">{{item.sum_lesson_hours}}</div></td>
                    				<td><div class="ivu-table-cell">{{item.sum_student_nums}}</div></td>
                    				<td><div class="ivu-table-cell">{{item.sum_lesson_amount}}</div></td>
                    			</tr>
                    		</tbody>
                    		<tr v-if="data.length==0">
                    			<td class="text-center" colspan="4"><div class="ivu-table-cell">没有数据</div></td>
                    		</tr>
                    		<tr v-else>
                    			<td><div class="ivu-table-cell">合计</div></td>
                    			<td><div class="ivu-table-cell text-primary">{{total_lesson_hours}}</div></td>
                    			<td><div class="ivu-table-cell text-primary">{{total_student_nums}}</div></td>
                    			<td><div class="ivu-table-cell text-primary">{{total_lesson_amount}}</div></td>
                    		</tr>
                    	</table>
                    </div>

                </div>

                <div class="content-footer">
 	            	<Alert>
 	            	    <span class="ml-3">总课时数：
 	            			<Tag color="orange">{{total_lesson_hours}}</Tag>
 	            		</span>	
 	            		<span class="ml-3">总学员人次：
 	            			<Tag color="green">{{total_student_nums}}</Tag>
 	            		</span>	
 	            		<span class="ml-3">总课时金额：
 	            			<Tag color="blue">{{label_currency}}{{total_lesson_amount}}</Tag>
 	            		</span>		            		
 	            	</Alert>
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
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectLesson,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_employee_outputs?group=lid',
				search_field: {
					int_day: util.recent_month_range(1),
					lid: 0,
					group: 'lid'
				},
				total_student_nums:0,
				total_lesson_hours:0,
				total_lesson_amount:0,
				column_keys: {
					lid: {
						title: '课程',
						show: true,
					},
					sum_lesson_hours: {
						title: '课时数',
						show: true,
						sortable:'custom'
					},
					sum_student_nums: {
						title: '学员人次',
						show: true,
						sortable:'custom'
					},
					sum_lesson_amount: {
						title: '课时金额',
						show:true,
						sortable:'custom'
					}
				},
				column_render: {
					lid(h, params) {
						return h('span',this.$filter('lesson_name')(params.row.lid))
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params['start_date'] = property[0]
							params['end_date']   = property[1]
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			deal_data(data){
				this.total_lesson_amount = data.total_lesson_amount
				this.total_lesson_hours  = data.total_lesson_hours
				this.total_student_nums  = data.total_student_nums
				return data.list
			},
		},

		computed: {
			
		}
	}
</script>