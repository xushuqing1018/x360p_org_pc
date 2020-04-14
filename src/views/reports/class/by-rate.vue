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

    			<Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable placeholder="请选择班级"></select-class>
    			</Form-item>

    			<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
    				<select-employee :rid="1" v-model="search_field.teach_eid" clearable :placeholder="label_choose_teacher"></select-employee>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<export-button res="report_class_by_rates" :params="params"></export-button>             	
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
                    v-loading.like="'report_class_by_rates'" 
                    ref="tableExcel"
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
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClass from 'c%/SelectClass.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectLesson,
			ExportButton,
			SelectEmployee,
			SelectClass
		},
		data() {
			return {
				rest_api: 'report_class_by_rates',
				search_field: {
					lid: 0
				},
				column_keys: {
	                class_name: {
						title: '班级名称',
						show: true,
						sortable:'cid',
						align:'left'
					},
					bid: {
						title: '校区',
						show: true,
						sortable:'bid',
						align:'center'
					},
					
					lesson_name: {
						title: '课程名称',
						show: true,
						align:'center'
					},
					teach_eid: {
						title: '上课'+this.$filter('translate')('老师'),
						show: true,
						sortable: 'teach_eid',
						align:'center'
					},
					plan_student_nums: {
						title: '预招人数',
						show: true,
						sortable:'plan_student_nums',
						align:'center'
					},
					student_nums: {
						title: '实际人数',
						show: true,
						sortable:'student_nums',
						align:'center'
					},
					nums_rate: {
						title: '满班率',
						show: true,
						sortable: 'nums_rate',
						align:'center'
					},


				},
				column_render: {
					lid(h, params) {
						return h('span',this.$filter('lesson_name')(params.row.lid))
					},
					class_name(h,params){
				        let row = params.row
				        if(row.class_type == 0){        	
			        		return h('div',[
				                h('Tag',{
				                    props:{
				                        color:'green'
				                    }
				                },'班'),
				                h('Tag',row.cid!=null?row.class_name:'')
				            ])
				        }else if(row.class_type == 1){
				        	return h('div',[
				                h('Tag',{
				                    props:{
				                        color:'yellow'
				                    }
				                },'临'),
				                h('Tag',row.cid!=null?row.class_name:'')
				            ])
				        }else if(row.class_type ==2){
				        	return h('div',[
				                h('Tag',{
				                    props:{
				                        color:'blue'
				                    }
				                },'活'),
				                h('Tag',row.cid!=null?row.class_name:'')
				            ])
				        }
			        },
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
			generateData() {
				let params = {
				}
				this.$rest(this.rest_api)
				.post(params)
				.success(response => {
					this.get_data()
				})
				.error(response => {
					this.$Message.error(response.body.message)
				})
			},
			get_data() {
				this.init_data()
			},
		},
		computed: {
			
		}
	}
</script>