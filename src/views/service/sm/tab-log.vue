<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form mt-3 row">
				<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>				
				<Form-item label="登录时间" prop="login_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.login_time" 
						label="选择日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>           	           	
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
		            	ref="tableExcel"
		            	v-loading="'mobile_login_logs'" 
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"> 
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
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
			</div>
		</div>		
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import selectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/dateRangePicker.vue'
	
	export default{
		mixins: [grid,globals],
		components: {
			selectStudent,
			dateRangePicker
		},
		data () {
			return {
				rest_api: 'mobile_login_logs',
				pk: 'mll_id',
				search_field: {
					sid: 0,
					login_time: []
				},
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					ip: {
						title: 'IP',
						show: true
					},
					login_time: {
						title: '登录时间',
						show: true
					}
				},
				column_render: {
					sid (h,params) {
						return h('span',params.row.student?params.row.student.student_name:'')
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='login_time') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else{
						if(property&&property!=-1){
							params[o] = property							
						}
					}
				}
			},
		}
	}
	
</script>

<style>
</style>