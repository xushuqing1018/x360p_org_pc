<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">

    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable placeholder="请选择课程"></select-lesson>
    			</Form-item>
    			<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
    				<select-student v-model="search_field.sid" clearable placeholder="请选择学员"></select-student>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

	            	<export-button res="report_student_by_unassigns" :params="params"></export-button>

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
                    v-loading.like="'report_student_by_unassigns'" 
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
	import SelectStudent from 'c%/SelectStudent.vue'
	import ExportButton from 'c%/ExportButton.vue'

	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectLesson,
			SelectStudent,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_student_by_unassigns',
				search_field: {
					lid: 0,
					sid: 0
				},
				column_keys: {
					lid: {
						title: '课程名称',
						show: true,
						align:'center'
					},
					student_name: {
						title: '学员',
						show: true,
						sortable:'sid',
						align:'center'
					},
					sno: {
						title: '学号',
						show: false,
						align:'center'
					},
					first_tel: {
						title: '手机号',
						show: true,
						align:'center'
                    },
                    school_id: {
                        title: '公立学校',
                        show: true
                    },
                    school_grade: {
                        title: '年级',
                        show: true
                    },
					remain_lesson_hours: {
						title: '剩余课时数',
						show: true,
						sortable:'remain_lesson_hours',
						align:'center'
					}
				},
				column_render: {
					cid(h, params) {
						let class_name = ''
						if(params.row.cls!=undefined) {
							class_name = params.row.cls.class_name
						}
						return h('span',class_name)
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
							params['day'] = util.sprintf('[between,%s,%s]',
								this.$filter('format_int_day')(property[0]),
								this.$filter('format_int_day')(property[1]))
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
			
		}
	}
</script>