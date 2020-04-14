<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form :label-width="80" class="row" ref="ref_search" :model="search_field">
				<Form-item label="投诉时间" class="col-md-3 mb-0" prop="create_time">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="学员姓名" class="col-md-3 mb-0" prop="sid">			
					<!--<Input style="width:260px" v-model="search_field.student_name" placeholder="请输入学员姓名"></Input>-->		
					<select-student v-model="search_field.sid" clearable></select-student>					
				</Form-item>				
			</Form>			  
			<Row>
				<Col span="24">
					<Button-group class="ml-3">
	                    <Button size="large" class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>     
	                    <!--<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>-->
	                </Button-group>
	            	<Button size="large" type="primary" icon="refresh" @click="resetSearch">重置</Button>

	            	<export-button size="large" res="advices" :params="params"></export-button>    
				</Col>
			</Row>
		</div>
		
		<div class="box box-result">
			<Button type="primary" icon="plus" @click="addInfo">添加</Button>
			<div class="content" style="margin-top: 10px">
	            <div class="content-body">
	                <Table 
            		ref="tableExcel"
                    v-loading="'advices'" 
                    :page-size="pageSize" 
                    :page="pageIndex" 
                    :stripe="true" 
                    :highlight-row="true"
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT"> 
	                </Table>
	            </div>
	            <div class="content-footer">
	                <div class="pagenation">
	                    <Page :total="total" 
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
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectStudent from 'c%/SelectStudent.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			SelectStudent,
			DateRangePicker,
			ExportButton
		},
		data () {
			return {
				rest_api: 'advices',
				search_field: {
					sid: 0,
					create_time: []
				},
				column_keys: {
					sname: {
						title: '姓名',
						show: true
					},
					content: {
						title: '投诉内容',
						show: true
					},
					from_type: {
						title: '投诉来源',
						show: true
					},
					create_time: {
						title: '投诉时间',
						show: true
					}				
				},
				column_render: {
					sname(h,param) {
						return h('span',param.row.student.student_name)
					},
					from_type(h,param) {
						return h('span',param.row.student.student_name==0?'学习管家':'后台登记')
					},
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			addInfo() {
				this.$Modal.open('service/sm/complaint-add-modal.vue@modal',{
					on: {
						update: () => {
							this.init_data();
						}
					}
				})
				.then(modal => {
					modal.show('添加投诉建议')
				})
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {				
				let search_obj = util.copy(this.search_field)
				
				params.with = 'student'
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}
					else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
			}			
		}
	}
</script>

<style>
</style>