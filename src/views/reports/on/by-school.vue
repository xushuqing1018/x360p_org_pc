<template>
	<div>
		<div class="box box-query">

    		<!-- <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
    			            <Form-item label="公立学校" prop="ps_id" class="col-sm-6 col-md-3" >
    					      	<select-school v-model="search_field.ps_id" clearable></select-school>
    						</Form-item>
    		            </Form> -->

    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<Button type="primary" @click="refresh" icon="refresh">刷新</Button>
	            	<export-button res="report_student_by_pss" :params="school_params"></export-button>

                </Col>
            </Row>
		</div>

		<div class="box box-result">
            
            <!-- 选择列 -->
			<div class="toolbar">
				<filter-column :keys="column_keys"></filter-column>
			</div>

	        <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading="'report_student_by_pss'" 
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
	import ExportButton from 'c%/ExportButton.vue'
	import SelectSchool from '@/views/system/basic/school/select-school.vue'

	const default_column$ = {				
		ps_name: {
			title: '学校',
			width:250,
			show: true,
		},
		student_nums: {
			title: '总人数',
			show: true,
		}		
	}

	export default {
		mixins: [grid,common,globals],
		components: {
			ExportButton,
			SelectSchool
		},
		data() {
			return {
				rest_api: 'report_student_by_pss',
				search_field: {
					ps_id: 0,
				},
				isRefresh: false,
				school_params:{
	                search_field:'name',
	                search_value:'',
	                order_field:'',
	                order_sort:'',
	                last_search_value:'',
	                bids: this.$store.state.branch.ids,
	            },
				pageSize: 10,

				column_keys: default_column$,

                column_render: {
					bid(h, params) {
						return h('span',this.$filter('branch_name')(params.row.bid))
					}
				}
			}
		},
		watch: {
			'$store.state.branch.ids': {
				handler: function (val) {
					this.initColumn()
				},
				deep:true
			}
		},
		mounted() {
			this.init_data()
			this.initColumn()
			this.$store.commit('branchMultiMode')
		},
		methods: {
			setClickRow (h,row,field) {
				let result = h('span',row[field])
				
				if(parseInt(row[field]) > 0){
					result = h('span',{
						'class': 'text-info cursor',
						on:{
							'click': () => {
								this.performanceDetail(row,field)
							}
						}
					},row[field])
				}
				
				return result	
			},
			performanceDetail (row,field) {
				let search_field = this.search_field,					
					rest_api = '',
					index = field.lastIndexOf('bid'),
					bid = field.substring(index + 3)
				
				rest_api = `report_student_by_pss/${row.ps_id}?bid=${bid}`
				
				this.$Modal.open('reports/on/student-detail-modal.vue',{
					props: {
	
					}
				})
				.then(modal=>{
					modal
					.set('rest_api',rest_api)					
					.show(this.$filter('branch_name')(bid))
				})
			},

			initColumn () {
				let bids = this.bids$,
					result = []
				this.column_keys = util.copy(default_column$)
				if(bids && bids.length > 0){
					bids.forEach(b=>{
						let field = 'student_nums_bid'+b,
							obj = {
								title: this.$filter('branch_name')(b),
								show: true,
								sortable:field
							},							
							render = (h,params) => {
								return this.setClickRow(h,params.row,field)
							}
							
						this.$set(this.column_keys,field,obj)
						this.$set(this.column_render,field,render)
					})
				}
			},
			deal_data(res) {
                this.data = res.list
                return res.list
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
                    if (o=='bids'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				if(this.isRefresh){
                    params.refresh = 1
                }
                this.isRefresh = false
			},
			refresh () {
                this.isRefresh = true
                this.init_data()
            },
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
		
			get_data() {
				this.init_data()
			},
		},
		computed: {
			bids$ () {
				return this.$store.state.branch.ids
			},
		}
	}
</script>
