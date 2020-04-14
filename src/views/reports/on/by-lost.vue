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

	            	<export-button res="report_student_by_quits" :params="params"></export-button>      	               	
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
                    v-loading.like="'report_student_by_quits'" 
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
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import ExportButton from 'c%/ExportButton.vue'
    import selectLesson from 'c%/SelectLesson.vue'
    import SelectStudent from 'c%/SelectStudent.vue'

	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectEmployee,
			SelectClass,
			ExportButton,
            selectLesson,
            SelectStudent
		},
		data() {
			return {
				rest_api: 'report_student_by_quits',
				search_field: {
					int_day: util.recent_month_range(1),
                    eid: 0,
                    sid: 0
				},
				column_keys: {
					bid: {
                        title: '校区',
                        show: true,
                        sortable: 'bid'
					},
					eid: {
						title: '学管师',
						width: 250,
						show: true,
					},
					sid: {
						title: '姓名',
						show: true,
					},
					first_tel: {
						title: '电话',
						show: true,
                    },
                    school_id: {
                        title: '公立学校',
                        show: true
                    },
                    school_grade: {
                        title: '年级',
                        show: true
                    },
					quit_time: {
						title: '流失时间',
						show: true,
					},
					quit_reason: {
						title: '流失原因',
						show: true,
					}
				},
				column_render: {
					eid(h, params) {
						return h('span',this.$filter('ename')(params.row.eid))
                    },
                    school_id (h,params) {
						return h('span',this.school_name(params.row.school_id) || '-')
					},
                    school_grade (h,params) {
						return h('span',this.labelDicts(params.row.school_grade,'grade') || '-')
					}
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
			},
			generateData() {
				if(!this.checkDate()) return
				let date = this.search_field.int_day
				let params = {
					start_date: date[0],
					end_date: date[1]
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
