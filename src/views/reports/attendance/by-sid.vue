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
    			<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
    				<select-student v-model="search_field.sid" clearable placeholder="请选择学员"></select-student>
    			</Form-item>
    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable placeholder="请选择班级"></select-class>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<export-button res="report_attendance_students" :params="params"></export-button>
	            	<CheckboxGroup v-model="search_field.lesson_type" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="0">班课</Checkbox>
                		<Checkbox :label="1">一对一</Checkbox>
                		<Checkbox :label="2">一对多</Checkbox>
                	</CheckboxGroup>           	
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
                    v-loading.like="'report_attendances'" 
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
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import ExportButton from 'c%/ExportButton'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectStudent,
			SelectClass,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_attendances?group=sid',
				search_field: {
					int_day: util.recent_month_range(1),
					sid: 0,
					cid: 0,
					lesson_type: [0,1,2]
				},
				column_keys: {
					sid: {
						title: '学员',
						show: true,
					},
					sno: {
						title: '学号',
						show: true,
						sortable:'custom'
					},
					bid: {
						title: '所属校区',
						show: true,
						sortable:'custom'
					},
					total_class_attendance: {
						title: '上课次数',
						show: true,
						sortable:'custom'
					},
					total_student_attendance: {
						title: '应到人次数',
						show: true,
						sortable:'custom'
					},
					in_consume_num: {
						title: '出勤计费次数',
						show: true,
						sortable:'custom'
					},
					in_unconsume_num: {
						title: '出勤未计费次数',
						show: true,
						sortable:'custom'
					},
					in_rate: {
						title: '出勤率',
						show:true,
						sortable:'custom'
					},
					out_consume_num: {
						title: '缺勤计费次数',
						show: true,
						sortable:'custom'
					},
					out_unconsume_num: {
						title: '缺勤未计费次数',
						show: true,
						sortable:'custom'
					},
					out_rate: {
						title: '缺勤率',
						show:true,
						sortable:'custom'
					}
				},
				column_render: {
					sid(h,params) {
						return h('span',params.row.student.student_name)
					},
					sno(h,params) {
						return h('span',params.row.student.sno)
					},
					bid(h,params) {
						return h('span',this.$filter('branch_name')(params.row.student.bid))
					},
					in_rate(h, params) {
						return h('span',(util.div(params.row.total_in,params.row.total_student_attendance)*100).toFixed(2)+'%')
					},
					out_rate(h, params) {
						let total_out = util.sub(params.row.total_student_attendance, params.row.total_in)
						return h('span',(util.div(total_out, params.row.total_student_attendance)*100).toFixed(2)+'%')
					},
					operation(h,params) {
						return h('Button',{
                            props: {
                                type: 'primary',
                                size: 'small',
                            },
                            on: {
                                click: ()=>{
                                    
                                }
                            }
                        },'点我')
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
                            params['int_day'] = util.sprintf('[Between,%s]',property.join(','))
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
			}
		},
		computed: {
			
		}
	}
</script>