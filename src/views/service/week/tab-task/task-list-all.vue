<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="服务对象" class="col-md-3 col-sm-6">
					<select-class v-if="tab == 2" v-model="search_field.cid" placeholder="请选择服务对象"></select-class>
					<select-student v-if="tab == 1" v-model="search_field.sid" placeholder="请选择服务对象"></select-student>
				</Form-item>
				<Form-item label="服务类型" class="col-md-3 col-sm-6">
					<template>
						<Select v-model="search_field.st_did" clearable>
							<Option	:value="0">请选择</Option>
							<Option :value="item.did" v-for="(item,index) in (search_field.object_type == 2 ? class_service_type : student_service_type)" :key="index">{{item.title}}</Option>
						</Select>
					</template>
				</Form-item>
				<Form-item label="责任人" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.eid" placeholder="请选择责任人"></select-employee>
				</Form-item>
				<Form-item label="完成日期" class="col-md-3 col-sm-6">
					<date-range-picker  v-model="search_field.int_day" type="datetime" format="yyyy-MM-dd" placeholder="请选择完成日期"></date-range-picker>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button class="ml-2" type="primary" icon="ios-search" @click="search" >查询</Button>
					<Button class="ml-2" type="primary" icon="refresh" @click="resetSearch">重置</Button>
					<RadioGroup v-model="tab" type="button" style="margin-left:10px;" size="small">
        				<Radio :label="2">班级服务</Radio>
        				<Radio :label="1">个性服务</Radio>
    				</RadioGroup>
					<div class="pull-right">
	        		    <per-scope per="service_week.all" @on-change="perScopeChange"></per-scope>
	        		</div>
					<div class="pull-right mr-4">
                        <label>当前模式：</label>
                        <ButtonGroup>
                            <Button type="primary" icon="ios-list-outline">列表</Button>
                            <Button type="ghost" icon="grid" @click="turnGridArrange">表格</Button>
                        </ButtonGroup>
                    </div>
                </Col>
          	</Row>
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button class="ml-2" type="primary" icon="plus"  @click="record">记录</Button>
	        </div>
			<div class="content">
	        	<div class="content-body">
					<table class="modal-table">
	            		<thead>
	            			<tr>
	            				<th><div class="ivu-table-cell">#</div></th>
								<th><div class="ivu-table-cell">服务对象</div></th>
								<th><div class="ivu-table-cell">服务类型</div></th>
								<th><div class="ivu-table-cell">完成日期</div></th>
								<th><div class="ivu-table-cell">责任人</div></th>
	            				<th width="500"><div class="ivu-table-cell">服务内容</div></th>
								<th><div class="ivu-table-cell">相关附件</div></th>
								<th><div class="ivu-table-cell">操作</div></th>
	            			</tr>
	            		</thead>
	            		<tbody>
	            			<tr v-for="(item,index) in data" :key="index">
	            				<td><div class="ivu-table-cell">{{index + 1 + (pageIndex - 1) * pageSize}}</div></td>
	            				<td><div class="ivu-table-cell">{{item.object_type == 2 ? item.classes.class_name : item.student.student_name}}</div></td>
								<td><div class="ivu-table-cell">{{item.st_did | dict_title(item.object_type == 2 ? 'class_service_type' : 'student_service_type')}}</div></td>
								<td><div class="ivu-table-cell">{{item.int_day|int_date}}  {{item.int_hour|int_hour}}</div></td>
								<td><div class="ivu-table-cell">{{item.eid|ename}}</div></td>
								<td><div class="ivu-table-cell">{{item.content}}</div></td>
								<td>
									<div v-if="item.service_record_file.length != 0">
										<Poptip placement="left" width="400" trigger="hover">
    									    <Button>相关附件</Button>
											<div class="api" slot="content">
												<file-item :list="item.service_record_file"></file-item>
											</div>
    									</Poptip>
									</div>
								</td>
								<td>
                                   <div class="ivu-table-cell">
	                    		    	<Button type="text" size="small" icon="ios-trash" @click="delItem(item)"></Button>
	                    	       </div>
                                </td>
	            			</tr>
							<tr v-if="data.length==0"><td colspan="8"><div class="ivu-table-cell text-center">没有数据</div></td></tr>
	            		</tbody>
	            	</table>
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
            				@on-page-size-change="pagesize">
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

	import FileItem from 'c%/FileItem.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			FileItem,
			SelectClass,
			SelectStudent,
			SelectEmployee,
			DateRangePicker
		},
		data () {
			return {
				data: [],
				rest_api: 'service_records',
				tab:2,
				search_field:{
					object_type:2,
					cid:0,
					sid:0,
					eid:0,
					st_did:0,
					int_day:[]
				},
				pk: 'sr_id'
			}
		},
		computed:{
			student_service_type(){
				return this.dicts('student_service_type')
			},
			class_service_type(){
				return this.dicts('class_service_type')
			}
		},
		watch: {
			'tab': function() {
				this.search_field.object_type = this.tab
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			perScopeChange(value) {
				this.$emit('on-check',value)
			},
			turnGridArrange () {
            	this.$emit('on-turn-mode','grid')
        	},
			record() {
				this.$Modal.open('service/service/record-modal.vue',{
					props: {
						sid: 0,
						cid: 0,
						type: this.tab
					},
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.show('添加服务记录','add')
				})
			},
			delItem(item) {
				this.confirm('确定删除这条服务记录吗？')
				.then(() => {
					this.delete(item)
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property!=''&&property!==-1){
							params[o] = property	
						}		
					}	
				}
                
				params.with = 'service_record_file,' + (this.tab == 2 ? 'classes' : 'student')
			},
			resetSearch(){
				this.search_field.cid = 0
				this.search_field.sid = 0
				this.search_field.eid = 0
				this.search_field.st_did = 0
				this.search_field.int_day = []
				this.init_data()
			}
		}
	}
</script>