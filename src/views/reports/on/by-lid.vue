<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">

                <Form-item label="学员姓名" prop="student_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.student_name" placeholder="请输入学员姓名"></Input>
				</Form-item>

				<Form-item label="学号" prop="sno" class="col-md-3 col-sm-6">
					<Input v-model="search_field.sno" placeholder="请输入学员学号"></Input>
				</Form-item>

				<Form-item label="手机号码" prop="first_tel" class="col-md-3 col-sm-6">
					<Input v-model="search_field.first_tel" placeholder="请输入手机号码"></Input>
				</Form-item>

    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable placeholder="请选择课程"></select-lesson>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button>

	            	<export-button res="report_student_by_lessons" :params="params"></export-button>             	
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
                    v-loading="'report_student_by_lessons'"
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
				rest_api: 'report_student_by_lessons',
				search_field: {
					lid: 0
				},
				column_keys: {
					student_name: {
                        title: '姓名',
                        show: true,
                        align:'center'
					},
					sno: {
                        title: '学号',
                        show: false,
                        align:'center'
					},
					first_tel: {
                        title: '手机号码',
                        show: true,
                        align:'center'
					},
					bid: {
						title: '校区',
						show: true,
						align:'center'
					},
					lids_num: {
						title: '在读课程数',
						width: 250,
						show: true,
						align:'center'
					},
					lids_name: {
						title: '课程名称',
						show: true,
						align:'center'
					},

				},
				column_render: {
					lid(h, params) {
						return h('span',this.$filter('lesson_name')(params.row.lid))
					},
					lids_num (h,params) {
						return h('span',params.row.lids.length)
					},
					lids_name (h,params){
						let result = ''
						params.row.lids.forEach(l=>{
                            result += this.$filter('lesson_name')(l)+ ' 、' 
						})
						result = result.substring(0,result.length-1)
						return h('span',result)
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