<template>
	<div class="c-grid">
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
    				<select-student v-model="search_field.sid" clearable placeholder="请选择学员"></select-student>
    			</Form-item>
    			<Form-item label="班级名称" prop='cid' class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable></select-class>
    			</Form-item>
    			<Form-item label="课程名称" prop='lid' class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>
    			<Form-item label="校区" prop='bid' class="col-md-3 col-sm-6">
    				<select-branch v-model="search_field.bid" clearable></select-branch>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                    <Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button>
                    <export-button res="report_student_by_remainlessonhours" :params="params"></export-button>
                    <Button type="primary" icon="eye" class="pull-right" @click="viewDetail">查看详情</Button>
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
                    v-loading.like="'report_student_by_remainlessonhours'" 
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
	import SelectBranch from 'c%/SelectBranch.vue'
	
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectClass,
			ExportButton,
			SelectStudent,
			SelectLesson,
			SelectBranch
		},
		data() {
			return {
				rest_api: 'report_student_by_remainlessonhours',
				search_field: {
					cid: 0,
					lid: 0,
					bid: [],
					sid: 0
				},
				column_keys: {
					sid: {
						title: '学员姓名',
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
					bid: {
						title: '校区',
						show: true
					},
					lesson_hour: {
						title: '学员总课时',
						show: true
					},
					remain_lesson_hour: {
						title: '剩余课时',
						show: true
					},
					remain_money: {
						title: '剩余课时金额',
						show: true
					},
				},
				column_render: {
                    school_id (h,params) {
						return h('span',this.school_name(params.row.school_id) || '-')
					},
                    school_grade (h,params) {
						return h('span',this.labelDicts(params.row.school_grade,'grade') || '-')
					},
					remain_money(h,params) {
						return h('span',`${this.label_currency}${params.row.remain_money}`)
					}
				}
			}
		},
		created() {
			this.search_field.bid = util.copy(this.$store.state.branch.ids)
		},
		mounted() {
			this.init_data()
			this.$store.commit('branchMultiMode')
		},
		watch: {
			'$store.state.branch.ids':function(ids) {
				this.search_field.bid = util.copy(ids)
			}
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
					}else if(o=='bid') {
						if(property.length>0) {
							params[o] = util.sprintf('[in,%s]',property.join(','))
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
			viewDetail() {
				this.$emit('on-change')
			}
		}
	}
</script>