<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" prop="sid" class="col-sm-4">
				<select-student v-model="search_field.sid" clearable></select-student>
			</Form-item>
			<Form-item label="操作时间" prop="create_time" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.create_time" 
					@on-change="search" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
			<Form-item label="操作人" prop="create_uid" class="col-sm-4">
				<select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
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
		        v-loading="'student_lesson_operates'" 
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
		mixins:[modal,globals,common,grid],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'student_lesson_operates',
				search_field: {
					create_time: [],
					create_uid: 0,
					sid: 0
				},
				column_keys: {
					student_name: {
						title:'学员姓名',
						show:true
					},
					lesson_hours:{
						title:'课时数量',
						show:true
					},
					op_type:{
						title: '操作类型',
						show: true
					},
					create_time: {
						title:'操作时间',
						show:true
					},
					create_uid: {
						title: '操作人',
						show:true
					},
					remark: {
						title: '备注',
						show: true
					},
					op: {
						title: '操作',
						show: true,
						width: 80
					}
				},
				column_render: {
					student_name(h,params) {
						return h('span',params.row.student.student_name)
					},
					unit_price(h,params) {
						return h('span',this.label_currency+params.row.unit_price)
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					},
					create_uid(h,params) {
						let name = params.row.create_employee ? params.row.create_employee.ename : '-'
						return h('span',name)
					},
					op_type(h,params) {
						let map = {1:'手动赠送',4:'购买时赠送'}
						return h('span',map[params.row.op_type])
					},
					op(h,params) {
						return h('Button',{
							props: {
								type: 'ghost',
								size: 'small',
								shape: 'circle',
								icon: 'ios-undo',
								title: '撤销赠送'
							},
							directives: [
								{
									name:'per',
									value:'presenthours.undo'
								}
							],
							on: {
								click: () => {
									this.undoTransfer(params.row)
								}
							}
						})
					}
				}
			}
		},
		methods: {
			undoTransfer(row) {
				this.confirm('确定要撤销赠送吗？')
				.then(() => {
					this.$http.delete('student_lesson_operates/'+row.slo_id)
					.then(res => {
						this.$Message.success('撤销成功')
						this.$emit('on-success')
						this.init_data()
					},res => {
						this.error(res.body.message)
					})
				})
			},
			onModalOpen() {
				this.init_data()
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
				params.op_type = '[IN,1,4]'
				params.with = 'student,create_employee'
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
	}
</script>