<template>
	<div>
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="转出学员" prop="from_sid" class="col-sm-4">
				<select-student v-model="search_field.from_sid"></select-student>
			</Form-item>
			<Form-item label="转入学员" prop="to_sid" class="col-sm-4">
				<select-student v-model="search_field.to_sid"></select-student>
			</Form-item>
			<Form-item label="操作时间" prop="create_time" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.create_time" 
					@on-change="search" 
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
		        v-loading="'transfer_hour_historys'" 
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
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectStudent from 'c%/SelectStudent.vue'

	export default {
		mixins:[globals,common,grid],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'transfer_hour_historys',
				search_field: {
					create_time: [],
					from_sid: 0,
					to_sid: 0
				},
				column_keys: {
					from_student_name: {
						title:'转出学员',
						show:true
					},
					lesson_hours:{
						title:'转出课时数',
						show:true
					},
					to_student_name:{
						title: '转入学员',
						show: true
					},
					create_time: {
						title:'操作时间',
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
					lesson_hours(h,params) {
						let divs = []
						divs.push(h('p',params.row.lesson_hours))
						divs.push(h('p',this.$filter('lesson_name')(params.row.lid)))
						return h('div',divs)
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					},
					create_uid(h,params) {
						let name = params.row.create_employee ? params.row.create_employee.ename : '-'
						return h('span',name)
					},
					op(h,params) {
						return h('Button',{
							props: {
								type: 'ghost',
								size: 'small',
								shape: 'circle',
								icon: 'ios-undo',
								title: '撤销转让'
							},
							directives: [
								{
									name:'per',
									value:'transferhours.undo'
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
		mounted() {
			this.init_data()
		},
		methods: {
			undoTransfer(row) {
				this.confirm('确定要撤销转让吗？')
				.then(() => {
					this.$http.delete('transfer_hour_historys/'+row.thh_id)
					.then(res => {
						this.$Message.success('撤销成功')
						this.$emit('on-success')
						this.init_data()
					},res => {
						this.error(res.body.message)
					})
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
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
	}
</script>