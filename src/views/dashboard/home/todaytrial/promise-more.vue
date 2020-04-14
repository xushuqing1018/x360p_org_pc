<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="700" :mask-closable="false">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="客户姓名" prop="cu_id" class="col-sm-5">
				<select-customer v-model="search_field.cu_id" clearable></select-customer>
			</Form-item>
			<Form-item label="诺到时间" prop="promise_int_day" class="col-sm-5">
				<date-range-picker 
					v-model="search_field.promise_int_day" 
					placement="bottom"
					style="width:100%"
					clearable
					>
				</date-range-picker>					
			</Form-item>
		</Form>
		<Row class="basic">
            <Col span="24" class="mt-2 mb-2">
            	<Button class="ml-2" type="primary" size="small" icon="ios-search" @click="search">查询</Button>
            	<Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>      
		<div class="content-body">
	        <Table 
		        v-loading="'customer_follow_up'" 
		        ref="tableExcel"
		        :page-size="pageSize" 
		        :page="pageIndex" 	
		        :stripe="true" 
		        :show-header="true" 
		        :data="data" 
		        :columns="columns" 
		        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		        @on-sort-change="sortChange"> 
	        </Table>
	    </div>
	    <div class="content-footer">
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
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
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import moment 	 from 'moment'
	import util 	 from '@/libs/util'
	import modal 	 from '@/libs/modal.mixin'
	import grid 	 from '@/libs/grid.mixin'
	import common 	 from '@/libs/common.mixin'
	import globals 	 from '@/libs/globals.mixin'
	
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default{
		mixins: [modal,grid,common,globals],
		components: {
			SelectCustomer,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'customer_follow_up',
				search_field: {
					promise_int_day: util.today_range(),
					cu_id: 0
				},
				column_keys: {
					name: {
						title: '姓名',
						show: true,
					},
					ename: {
						title: this.$filter('translate')('老师'),
						show: true
					},
					promise_int_day: {
						title: '诺到日期',
						show: true
					},
					operation: {
						title: '是否到校',
						show: true
					},
					visit_int_day: {
						title: '到访时间',
						show: true
					}
				},
				column_render: {
					name(h, params) {
						let name = params.row.customer.name
						let map = {0:{icon:'help'},1:{icon:'male'},2:{icon:'female'}}
						return h('span',[h('Icon',{
							props: {
								type: map[params.row.customer.sex].icon
							}
						}),' '+name] )
					},
					ename(h, params) {
						let ename = '-'
						if(params.row.eid>0) {
							ename = this.$filter('ename')(params.row.eid)
						}
						return h('span',ename)
					},
					promise_int_day(h,params) {
						let promise = params.row.promise_int_day
						if(promise) {
							return h('span',this.$filter('int_date')(promise))
						}
						return h('span','-')
					},
					visit_int_day(h,params) {
						let visit = params.row.visit_int_day
						if(visit) {
							return h('span',this.$filter('int_date')(visit))
						}
						return h('span','-')
					},
					operation(h,params) {
						let result
						if(params.row.is_visit>0) {
							result = h('Tag',{
								props: {
									color: 'green'
								}
							},'已到访')
						}else{
							result = h('Button',{
								props: {
									type: 'default',
									size: 'small'
								},
								on: {
									click:()=>{
										this.visit(params.row)
									}
								}
							},'确认到访')
						}
						return result
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			visit(row) {
	        	this.$Modal.open('dashboard/home/todaytrial/visit-confirm.vue@modal',{
	        		on: {
	        			'on-success':() => {
	        				this.refreshData()
	        			}
	        		}
	        	})
	        	.then(modal=>{
	        		modal.vuec.set('item',row)
	        		.show(util.sprintf('确认到访【%s】',row.customer.name))
	        	})
			},
			refreshData() {
				this.$emit('on-success')
				this.init_data()
			},
			close() {
				this.modal$.show = false
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param(params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='promise_int_day') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}else{
							params[o] = '[>,0]'
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
			}
		}
	}
</script>