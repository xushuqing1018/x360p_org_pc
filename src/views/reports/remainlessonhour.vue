<template>
	<div class="c-grid">
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="学员姓名" prop="student_name" class="col-md-3 col-sm-6">
    				<Input v-model="search_field.student_name" placeholder="请输入学员姓名"></Input>
    			</Form-item>
    			<Form-item label="学员班级" prop='cid' class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable></select-class>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<Button type="primary" icon="ios-download-outline" v-per="'reports.export'" @click="exportExcel('在读学员统计-按课程')">导出</Button>              	
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
                    v-loading.like="'report_student_lessons'" 
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
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectClass from 'c%/SelectClass.vue'
	
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectClass
		},
		data() {
			return {
				rest_api: 'report_student_lessons/student',
				search_field: {
					cid: 0,
					student_name: ''
				},
				column_keys: {
					sid: {
						title: '学员',
						width: 250,
						show: true,
					},
					total_lesson_hours: {
						title: '学员总课时',
						show: true
					},
					remain_lesson_hours: {
						title: '剩余课时',
						show: true
					},
					remain_lesson_amount: {
						title: '剩余金额',
						show: true
					}
				},
				column_render: {
					sid(h, params) {
						return h('span',params.row.student_name)
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