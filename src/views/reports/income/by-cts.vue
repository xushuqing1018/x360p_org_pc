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
    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable placeholder="请选择班级"></select-class>
    			</Form-item>
    			<Form-item label="标签" prop="tag_id" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.tag_id">
    					<Option v-for="item in classTags" :value="item.tag_id" :key="item.tag_id">{{item.tag_name}}</Option>
    				</Select>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<export-button res="report_cts_consumes" :params="params"></export-button>
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
                    v-loading.like="'report_cts_consumes'" 
                    :pageSize="pageSize" 
                    :page="pageIndex" 
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    @on-sort-change="sortChange"
                    > 
                    </Table>
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
	import SelectClass from 'c%/SelectClass.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectClass,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_cts_consumes?group=sid',
				search_field: {
					int_day: util.recent_month_range(1),
					cid: 0,
					tag_id:0
				},
				classTags: [],
				pageSize:10000,
				total_lesson_hours:0,
				total_lesson_amount:0,
				column_keys: {
					tag_name:{
						title:'标签',
						show:false,
					},
					class_name: {
						title: '班级',
						show: true,
					},
					teacher_name:{
						title:'授课教师',
						show:true
					},
					student_name:{
						title:'学员姓名',
						show:true
					},
					need_consume_lesson_hours: {
						title: '应出勤课时数',
						show: true
					},
					total_consume_lesson_hours: {
						title: '消耗课课时数',
						show: true,
						sortable:'custom'
					},
					total_absence_lesson_hours: {
						title: '缺勤课时数',
						show: true
					},
					total_consume_lesson_amount: {
						title: '耗课金额',
						show: true,
						sortable:'custom'
					},
					unit_lesson_hour_amount: {
						title: '单课时金额',
						show:true
					},
					total_remain_lesson_hours: {
						title: '剩余课时数',
						show: true
					},
					total_remain_lesson_amount: {
						title: '剩余课时金额',
						show: true
					},
					money: {
						title: '钱包余额',
						show: true
					}
				}
			}
		},
		mounted() {
			this.getClassTags()
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
					}else if (o=='lesson_type'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
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
				this.total_lesson_amount = data.sum_lesson_amount
				this.total_lesson_hours  = data.sum_lesson_hours
				return data.list
			},
			getClassTags() {
				this.$rest('tags')
				.get({
					tag_type: 2
				})
				.success(res => {
					this.classTags = res.list
				})
				.error(res => {

				})
			}
		},
		computed: {
			
		}
	}
</script>