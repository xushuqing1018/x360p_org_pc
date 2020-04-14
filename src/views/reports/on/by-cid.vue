<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="年 / 月" prop="int_day" class="col-md-3 col-sm-6">
					<DatePicker type="month" :value="search_field.int_day" @on-change="search_field.int_day=$event" placeholder="请选择年月"></DatePicker>
    			</Form-item>
    			<Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable placeholder="请选择班级"></select-class>
    			</Form-item>
    			<Form-item label="课程名称" prop="lid" class="col-md-3 col-sm-6">
	                <select-lesson :rid="1" v-model="search_field.lid" clearable></select-lesson>
	            </Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button>  
	            	<export-button res="report_student_by_classes" :params="params"></export-button>
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
                    v-loading="'report_student_by_classes'"
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
	import SelectClass from 'c%/SelectClass.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectClass,
			ExportButton,
			selectLesson
		},
		data() {
			return {
				rest_api: 'report_student_by_classes',
				search_field: {
					// int_day: util.recent_month_range(1),
					int_day: moment().format('YYYY-MM-DD'),
					cid: 0
				},
				column_keys: {
					class_name: {
						title: '班级名称',
						width: 250,
						show: true,
						align:'left'
					},
					bid: { 
                        title: '校区',
                        show: true,
                        sortable:'bid',
                        align:'center'
					},
					initial_student_num: {
						title: '月初人数',
						show: true,
						sortable:'initial_student_num',
						align:'center'
					},
					sum_in_student_num: {
						title: '本月转入',
						show: true,
						sortable:'sum_in_student_num',
						align:'center'
					},
					sum_out_student_num: {
						title: '本月转出',
						show: true,
						sortable:'sum_out_student_num',
						align:'center'
					},
					final_student_num: {
						title: '月末人数',
						show: true,
						sortable:'final_student_num',
						align:'center'
					}
				},
				column_render: {
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
			this.$store.commit('branchMultiMode')
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							let first_day = moment(property).startOf('month').format('YYYY-MM-DD'),
								end_day    = moment(property).endOf('month').format('YYYY-MM-DD')
								params['start_date'] = first_day
						     	params['end_date']   = end_day
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
				if(!this.checkDate()) return
				let date = this.search_field.int_day

			    let search_obj = util.copy(this.search_field)
			    let params = {}
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							let first_day = moment(property).startOf('month').format('YYYY-MM-DD'),
								end_day    = moment(property).endOf('month').format('YYYY-MM-DD')
								params['start_date'] = first_day
						     	params['end_date']   = end_day
						}												
					}								
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
				if(!this.checkDate()) return
				this.init_data()
			},
			checkDate() {
				if(this.search_field.int_day[0] === '') {
					this.$Message.error('时间段不能为空')
					return false
				}
				return true
			}
		},
		computed: {
			
		}
	}
</script>