<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">

    			<Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable placeholder="请选择班级"></select-class>
    			</Form-item>

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

    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button> 
	            	<export-button res="report_demolesson_by_cids" :params="params"></export-button>     

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
                    v-loading.like="'report_demolesson_by_teachers'" 
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
	import SelectClass from 'c%/SelectClass.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectClass,
			ExportButton,
		},
		data() {
			return {
				rest_api: 'report_demolesson_by_teachers',
				search_field: {
					cid: 0,
					int_day: util.recent_month_range(1),
				},

				column_keys: {
                    cid:{
						title: '班级名称',
						show: true,
						align: 'center',
						sortable: 'cid',
					},
					lid:{
						title: '课程名称',
						show: true,
						align: 'center',
					},
					
					sids:{
						title:'体验人数',
						show: true,
						align: 'center',
						sortable: 'sids',
					},
					transfered_sids:{
						title: '转化人数',
						show: true,
						align: 'center',
						sortable: 'transfered_sids',
					},
					rate:{
						title: '转化率',
						show: true,
						align: 'center',
					}

				},
				column_render: {
			
				}
			}
		},
		mounted() {
			this.init_data()
			this.$store.commit('branchSingleMode')
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							if(property!=','&&property.length>0){
								params['start_date'] = property[0]
								params['end_date']   = property[1]
							}
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