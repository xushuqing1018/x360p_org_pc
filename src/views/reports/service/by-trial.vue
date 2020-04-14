<template>
	<div class="c-grid">
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
    			<Form-item label="学员姓名" prop="student_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.student_name" placeholder="请输入学员姓名"></Input>
				</Form-item>
    			<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
    				<select-employee :rid="1" v-model="search_field.teach_eid" clearable :placeholder="label_choose_teacher"></select-employee>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                    <Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button>
	            	<export-button res="report_trials" :params="params"></export-button>    

	            	<CheckboxGroup v-model="search_field.status" class="ml-3" style="display: inline-block;">
                        <Checkbox :label="0">
                            <span>未报读</span>
                        </Checkbox>
                        <Checkbox :label="1">
                            <span>已报读</span>
                        </Checkbox>
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
                    v-loading.like="'report_trials'" 
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
	import ExportButton from 'c%/ExportButton.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			ExportButton,
			SelectEmployee,
		},
		data() {
			return {
				rest_api: 'report_trials',
				search_field: {
					int_day: util.recent_month_range(1),
					lid: 0,
					status: [0,1]
				},
				column_keys: {
	
					student_name: {
						title: '学员姓名',
						show: true,
						align:'center'
					},
					status: {
						title: '状态',
						show: true,
						sortable: 'status',
						align:'center'
					},
					teach_eid: {
						title: '试听课老师',
						show: true,
						align:'center'
					},
					sign_amount: {
						title: '报读金额',
						show: true,
						align:'center'
					},
					sign_time: {
						title: '报读日期',
						show: true,
						align:'center'
					},
					lid: {
						title: '报读课程',
						show: true,
						align:'center'
					},
					receive_amount: {
						title: '实收费金额',
						show: true,
						align:'center'
					},
					eid: {
						title: '收款人',
						show: true,
						align:'center'
					},
				},
				column_render: {
					status(h,params){
						let map = {0:'未报读',1:'已报读'}
						return h('span',map[params.row.status])
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
							params['start_date'] = property[0]
							params['end_date']   = property[1]
						}												
					}else if (o=='status'){
                        if(property.length>0){
                            params[o] = util.sprintf('[In,%s]',property.join(','))
                        }
                    }
					else{
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