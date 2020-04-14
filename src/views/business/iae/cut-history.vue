<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="学员" prop="sid" class="col-sm-4">
				<select-student v-model="search_field.sid" placeholder="请选择学员"></select-student>
			</Form-item>
			<Form-item label="操作时间" prop="create_time" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.create_time" 
					@on-change="search" 
					label="选择操作时间" 
					placement="bottom"
					style="width:100%">
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
		        v-loading="'order_cut_amounts'" 
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
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	
	import SelectStudent from 'c%/SelectStudent.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins:[modal,globals,common,grid],
		components: {
			SelectStudent,
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'order_cut_amounts',
				search_field: {
					create_time: [],
					sid: 0
				},
				column_keys: {
					student_name: {
						title:'扣款学员',
						show:true
					},
					amount:{
						title:'金额',
						show:true
					},
					cutamount_did:{
						title: '扣款类型',
						show: true
					},
					type: {
						title: '来源',
						show:true
					},
					slh_id: {
						title: '违约课消',
						show: true
					},
					cut_int_day: {
						title:'扣款日期',
						show:true
					},
					create_time: {
						title:'操作时间',
						show:true
					},
					create_employee_name: {
						title: '经办人',
						show: true
					},
					operate: {
						title: '操作',
						show:true
					}
				},
				column_render: {
					student_name(h,params) {
						return h('span',params.row.student.student_name)
					},
					cutamount_did(h,params) {
						return h('span',this.labelDicts(params.row.cutamount_did,'cutamount'))
					},
					type(h,params) {
						let map = {1:'结转',2:'退款'}
						return h('span',map[params.row.type])
					},
					cut_int_day(h,params) {
						return h('span',this.$filter('int_date')(params.row.cut_int_day))
					},
					slh_id(h,params) {
						let slh = params.row.slh_id
						return h('span',{
							'class': {
								'text-success': slh>0
							}
						},slh>0?'已转化':'未转化')
					},
					operate(h,params) {
						let slh = params.row.slh_id
						if(slh==0) {
							return h('Button',{
								props: {
									type: 'ghost',
									size: 'small',
									shape: 'circle',
									icon: 'shuffle'
								},
								attrs: {
									title: '转为违约课消'
								},
								on: {
									click: () => {
										this.confirm('是否转为违约课消')
										.then(() => {
											this.dotransfer(params.row)
										})
									}
								}
							})
						}
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				this.init_data()
			},
			dotransfer(row) {
				this.$rest('order_cut_amounts').add_url_param(row.oca_id,'doconsume')
				.post()
				.success(res => {
					this.$Message.success('转化成功')
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'student'
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
	}
</script>