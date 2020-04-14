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
				    <export-button res="report_attendances" :params="attendance_params"></export-button>
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
				rest_api: 'report_attendances?group=lid',
				search_field: {
					int_day: util.recent_month_range(1),
					lid: 0
				},
				column_keys: {
					lid: {
						title: '课程',
						show: true,
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
					lid(h, params) {
						return h('span',this.$filter('lesson_name')(params.row.lid))
					},
					in_rate(h, params) {
						return h('span',util.mul(params.row.in_rate,100).toFixed(2)+'%')
					},
					out_rate(h, params) {
						return h('span',util.mul(params.row.out_rate,100).toFixed(2)+'%')
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
		},
		computed: {
            attendance_params() {
                return Object.assign({},this.params,{
                    group: 'lid'
                })
            },
		}
	}
</script>