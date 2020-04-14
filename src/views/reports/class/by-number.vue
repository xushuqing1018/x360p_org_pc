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
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="refresh">刷新统计</Button>
	            	<export-button res="report_class_by_numbers" :params="params"></export-button>
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
                    v-loading.like="'report_class_by_numbers'" 
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
				rest_api: 'report_class_by_numbers',
				search_field: {
					lid: 0,
                    int_day: util.recent_month_range(1),
				},
				column_keys: {
	                class_name: {
						title: '班级名称',
                        width: 180,
						show: true,
					},
					bid: {
						title: '校区',
						show: true,
						sortable:'bid',
					},
					lesson_name: {
						title: '课程名称',
						show: true,
					},
					teacher_name: {
						title: '上课'+this.$filter('translate')('老师'),
						show: true,
					},
					second_eids:{
                        title: this.$filter('translate')('助教'),
                        show: false
					},
					advance_nums: {
                        title : '预招人数',
						show: true,
						sortable: 'custom',
					},
					class_nums: {
						title: '班级人数',
						show: true,
                        sortable: 'custom',
					},
					class_rate: {
	                    title : '满班率',
						show:true,
					},
					renew_nums: {
	                    title : '续报人数',
						show : true,
						sortable: 'custom'
					},
					renew_rate: {
                        title: '续报率',
						show: true
					}
				},
				column_render: {
                    class_rate(h, params) {
						return h('span', (util.div(params.row.class_nums, params.row.advance_nums) * 100).toFixed(2) + '%')
                    },
                    renew_rate(h, params) {
                        if(params.row.class_nums == 0){
                            return h('span', '0.00%')
						}else {
                            return h('span', (util.div(params.row.renew_nums, params.row.class_nums) * 100).toFixed(2) + '%')
                        }
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

                if(this.isRefresh){
                    params.refresh = 1
                }
                this.isRefresh = false
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
            refresh () {
                this.isRefresh = true
                this.init_data()
            },
			get_data() {
				this.init_data()
			},
		},
		computed: {
			
		}
	}
</script>