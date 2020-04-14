<template>
	<div class="c-grid">
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="时间" prop='today' class="col-md-3 col-sm-6">
                	<Date-picker type="date" v-model="search_field.today" placeholder="选择日期"></Date-picker>
                </Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                    <Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button>
                    <!-- <export-button res="report_student_by_remainlessonhours" :params="params"></export-button> -->
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
	import ExportButton from 'c%/ExportButton.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectClass,
			ExportButton,
			SelectStudent,
			SelectLesson,
			SelectEmployee
		},
		data() {
			return {
				rest_api: 'report_lessonhours',
				search_field: {
					today: util.today_int_day(),
					// today: '2018-07-24',
				},
				column_keys: {
					bid: {
						title: '校区',
						align: 'center',
						show: true,
						sortable: 'bid',
					},
					origin_lesson: {
                        title: '期初课时/金额',
                        align: 'center',
                        show: true,
					},
					sign_lesson: {
						title: '报名课时/金额',
						align: 'center',
						show: true
					},
					send_lesson_num: {
						title: '赠送课时',
						align: 'center',
						show: true
					},
					convert_lesson: {
						title: '结转课时/金额',
						align: 'center',
						show: true
					},
					consume_lesson: {
						title: '消费课时/金额',
						align: 'center',
						show: true
					},
					refund_lesson: {
						title: '退费课时/金额',
						align: 'center',
						show: true
					},
					remain_lesson: {
						title: '剩余课时/金额',
						align: 'center',
						show: true
					},
				},
				column_render: {
                    origin_lesson(h,params){
                    	return h('span',params.row.origin_lesson_num+' / '+params.row.origin_lesson_amount)
                    },
                    sign_lesson(h,params){
                    	return h('span',params.row.sign_lesson_num+' / '+params.row.sign_lesson_amount)
                    },
                    convert_lesson(h,params){
                    	return h('span',params.row.convert_lesson_num+' / '+params.row.convert_lesson_amount)
                    },
                    consume_lesson(h,params){
                    	return h('span',params.row.consume_lesson_num+' / '+params.row.consume_lesson_amount)
                    },
                    refund_lesson(h,params){
                    	return h('span',params.row.refund_lesson_num+' / '+params.row.refund_lesson_amount)
                    },
                    remain_lesson(h,params){
                    	return h('span',params.row.remain_lesson_num+ ' / '+params.row.remain_lesson_amount)
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
					if(o=='today'){
						params['today'] = property					
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