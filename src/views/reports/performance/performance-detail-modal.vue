<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<div class="ivu-table-wrapper" style="max-height:550px;overflow-y:auto;overflow-x:hidden">
			<Table 
				:border="true"
            	:data="data" 
            	:columns="res_columns" 
            	:show-header="true" 
            	> 
            </Table>
            <Spin fix v-if="loading">
            	<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            	<div><span v-if="branchs.length>10">当前校区过多，</span>正在努力生成报表</div>
            </Spin>
			<div class="mt-3 clearfix">
                <Page 
                	transfer
	                size="small"
	                class="pull-right"
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
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<export-button res="report_details" :params="report_params" v-per="'reports.export'"></export-button>
		</div>
	</Modal>
</template>
<script>
	import grid from '@/libs/grid.mixin'
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default {
		mixins: [ grid,modal,globals ],
		props: {
			intDay: {
				type: Array,
				default: ()=>{
					return []
				}
			},
			id: {
				type: [String, Number],
				default: 0
			},
			eid: {
				type: [String, Number],
				default: 0
			},
			branchId: {
				type: [String, Number],
				default: 0
			},
			type: {
				type: String,
				default: ''
			},
			table: {
				type: String,
				default: ''
			},
			deptId: {
				type: [String, Number],
				default: -1
			},
			exportParams: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		components: {
			ExportButton
		},
		data() {
			return {
				rest_api: '',
				res_columns: []
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.init_data()
				}
			}
		},
		computed: {
			report_params () {
				let params = {}
				let int_day = this.intDay
				if(int_day != ',' && int_day.length > 0) {
					params = {
						id: this.id,
						type: this.type,
						start_date: int_day[0],
						end_date: int_day[1]	
					}					
				}	
				
				if(this.table != '') params.table = this.table 
				
				if(this.deptId > -1) params.dept_id = this.deptId
				
				if(this.eid) params.eid = this.eid
				if(this.branchId) params.branchId = this.branchId
				
				return Object.assign(params,this.exportParams)				
			}
		},
		methods: {
			deal_data (data) {
				this.res_columns = data.columns
								
				return data.list
			}
		}
	}
</script>