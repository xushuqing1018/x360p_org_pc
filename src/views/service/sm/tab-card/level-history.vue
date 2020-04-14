<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="操作类型" prop="op_type" class="col-sm-4">
				<Select v-model="search_field.op_type" clearable>
					<Option :value="k" v-for="(v,k) in op_map">{{v}}</Option>
				</Select>
			</Form-item>
			<Form-item label="操作日期" prop="op_int_day" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.op_int_day" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
			<Form-item label="操作人" prop="op_eid" class="col-sm-4">
				<select-employee v-model="search_field.op_eid" clearable></select-employee>
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
		        v-loading="'user_card_level_historys'" 
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
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectStudent from 'c%/SelectStudent.vue'

	export default {
		mixins:[globals,common,grid,modal],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'user_card_level_historys',
				search_field: {
					op_int_day: [],
					op_type: -1,
					op_eid: 0
				},
				op_map: {
					0:'开卡',
					1:'升级',
					2:'降级'
				},
				column_keys: {
					student_name: {
						title:'学员姓名',
						show:true
					},
					card_type:{
						title:'会员卡',
						show:true
					},
					op_type:{
						title:'操作类型',
						show:true
					},
					level_change: {
						title:'等级变化',
						show: true
					},
					op_eid: {
						title:'操作员工',
						show:true
					},
					op_int_day: {
						title:'操作日期',
						show:true
					},
					remark: {
						title: '备注',
						show:true
					}
				},
				column_render: {
					student_name(h,params) {
						let names = []
						let row = params.row
						if(row.user_card.user) {
							names = row.user_card.user.students.map(_=>_.student_name)
						}
						return h('span',names.join(','))
					},
					level_change(h,params) {
						return h('span',params.row.num)
					},
					card_type(h,params) {
						return h('span',params.row.card_type.card_name)
					},
					op_type(h,params) {
						return h('span',this.op_map[params.row.op_type])
					},
					op_eid(h,params) {
						return h('span',this.$filter('ename')(params.row.op_eid))
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='op_int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='op_type'){
						if(property!=-1) {
							params[o] = property
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
			}
		}
	}
</script>