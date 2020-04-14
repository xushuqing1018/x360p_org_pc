<template>
	<div>
		<div class="box box-query">
            
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    
	            	<export-button res="report_student_by_branchs" :params="exp_params"></export-button>          	
                </Col>
            </Row>
		</div>
		<div class="box box-result">
	        <div class="content">
                <div class="content-body">
                    <by-bid-chart :data="chartData" :loading="loading"></by-bid-chart>
                </div>
            </div>
	    </div>
		<div class="box box-result">
			<div class="toolbar">
				<filter-column :keys="column_keys"></filter-column>
			</div>
	        <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading.like="'report_students'" 
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
	import ByBidChart from './by-bid-chart.vue'
	import selectBranch from 'c%/SelectBranch.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			ByBidChart,
			selectBranch,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_students/branch',
				search_field: {
					bids:[]
				},
				exp_params:{
	                bids: this.$store.state.branch.ids,
				},
				pageSize: 20,
				column_keys: {
					bid: {
						title: '校区',
						width:250,
						show: true,
					},
					subtotal: {
						title: '总人数',
						show: true,
						sortable:'custom'
					}
				},
				column_render: {
					bid(h, params) {
						return h('span',this.$filter('branch_name')(params.row.bid))
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
					if(o=='bids'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
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
			chartData() {
				let x = [],y = []
				this.data.forEach(item => {
					x.push(item.subtotal)
					y.push(this.$filter('branch_name')(item.bid))
				})
				return {x,y}
			}
		}
	}
</script>