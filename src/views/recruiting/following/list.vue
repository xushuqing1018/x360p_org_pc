<style lang="less">
	.x-ivu-tooltip-popper{
		.ivu-tooltip-inner{
			white-space: normal !important;	
		}		
	}
</style>
<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
				<Form-item label="客户姓名" class="col-md-3 mb-0" prop="name">
					<Input v-model="search_field.name" placeholder="请输入客户姓名"></Input>
				</Form-item>
				<Form-item label="电话号码" class="col-md-3 mb-0" prop="first_tel">
					<Input v-model="search_field.first_tel" placeholder="请输入客户电话"></Input>
				</Form-item>
				<Form-item label="跟进时间" class="col-md-3 mb-0" prop="create_time">					
					<date-range-picker
						v-model="search_field.create_time" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-Item label="下次跟进" class="col-md-3 mb-0" prop="next_follow_time">
					<date-range-picker 
						v-model="search_field.next_follow_time" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-Item>
				<template v-if="searchExpand">
					<Form-Item label="跟进人" class="col-md-3 mb-0" prop="eid" v-if="type_following=='all'">
						<select-employee v-model="search_field.eid" clearable></select-employee>
					</Form-Item>
					<Form-Item label="意向级别" class="col-md-3 mb-0" prop="intention_level">
						<Rate v-model="search_field.intention_level"></Rate>
					</Form-Item>
					
					<Form-item label="承诺到访" class="col-md-3 mb-0" prop="is_promise">
						<Select v-model="search_field.is_promise">
							<Option :value="-1">不限</Option>
							<Option :value="0">未诺到访</Option>
							<Option :value="1">诺到访</Option>
						</Select>
					</Form-item>
					<Form-item label="客户状态" class="col-md-3 mb-0" prop="customer_status_did">
						<Select v-model="search_field.customer_status_did">
							<Option :value="0">不限</Option>
							<Option :value="item.did" v-for="item in dicts('customer_status')">{{item.title}}</Option>
						</Select>
					</Form-item>
				</template>
			</Form>
			
			<Row class="basic">
	            <Col span="24" class="mt-2" style="margin-left: 0;">
	            	<Button-group>
                        <Button type="primary" @click="search" icon="ios-search">查询</Button>     
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<export-button 
                	res="customer_follow_ups" 
                	:params="params"
                	:total="total"
                	:max-sync-nums="3000" 
                	:split-size="2000"
                	v-per="'flist.export'" 
                	>
                		
                	</export-button>
                	
                	<CheckboxGroup v-model="search_field.is_connect" class="ml-3" style="display: inline-block;">
                        <Checkbox :label="0">
                            <span>无效</span>
                        </Checkbox>
                        <Checkbox :label="1">
                            <span>有效</span>
                        </Checkbox>
                    </CheckboxGroup>
                	<Button type="ghost" class="ml-4" size="small" @click="getPromiseRecord">诺到记录</Button>
                	<div class="pull-right">
                        <per-scope per="flist.all" @on-change="perScopeChange"></per-scope>
                    </div>               	
	            </Col>
	        </Row>    
			
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="plus" @click="addInfo" v-per="'flist.add'">新增</Button>
				<recruiting-info-modal ref="ref_modal_recruiting" @on-success="init_data"></recruiting-info-modal>
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	v-loading="'customer_follow_up'" 
		            	ref="tableExcel"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
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
		
		<Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false">
			<Form :label-width="120">
				<Form-item label="选择到访日期">
					<DatePicker v-model="visit_int_day" type="date" placeholder="选择日期" style="width: 200px"></DatePicker>
				</Form-item>
			</Form>
			<div slot="footer">
				<Button type="primary" @click="ok" :loading="saving">确定</Button>
				<Button type="ghost" @click="cancel">取消</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import recruitingInfoModal from '../recruiting-info-modal.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common,modal],
		components: {
			SelectEmployee,
			DateRangePicker,
			recruitingInfoModal,
			ExportButton
		},
		data () {
			return {
				rest_api: 'customer_follow_up',
				pk: 'cfu_id',
				datakey: 'follow_up',
				follow_up: {},
				active_item: {},
				visit_int_day: '',
				type_following: '',
				search_field:{
					eid: 0,
					name: '',
					first_tel: '',
					is_promise: -1,
					intention_level: 0,
					customer_status_did: 0,
					create_time: [],
					next_follow_time:[],
					is_connect: [0,1]
				},
				column_keys: {
					name: {
						title: '姓名',
						show: true
					},
					first_tel: {
						title: '手机号码',
						show: true
					},					
					bid: {
						title: '所属校区',
						show: false
					},
					customer_status_did: {
						title: '客户状态',
						show: true
					},
					is_connect: {
						title: '是否有效',
						show: true
					},
					content: {
						title: '跟进内容',
						show: true
					},					
					eid: {
						title: '跟进人',
						show: false
					},		
					create_time: {
						title: '跟进日期',
						show: true
					},
					is_promise: {
						title: '承诺到访',
						show: true
					},
					promise_int_day: {
						title: '诺到日期',
						show: false
					},
					is_visit: {
						title: '实际到访',
						show: true
					},
					visit_int_day: {
						title: '到访日期',
						show: false,
						sortable:'custom'
					},
					next_follow_time: {
						title: '下次跟进',
						show: true,
						sortable:'custom'
					},
					intention_level: {
						title: '意向级别',
						width: 180,
						sortable:'custom',
						show: true
					},
					from_did_name: {
						title: '招生来源',
						show: false,
					},
					market_channel_name: {
						title: '市场渠道',
						show: false,
					},
				},
				column_render: {
					name (h,params) {
						let map = {0:{icon:'help',text:'未设置'},1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}}
						return h('a',{
							attrs: {
								'class': 'x-a-link text-info',
								title: map[params.row.customer.sex].text
							},
							on: {
								click: ()=>{
									this.editInfo(params.row)
								}
							}
						},[h('Icon',{
							props: {
								type: map[params.row.customer.sex].icon
							}
						}),' '+params.row.customer.name])
					},
					first_tel (h,params) {
						return h('span',params.row.customer.first_tel||'-')
					},
					bid (h,params) {
						return h('span',this.labelBranch(params.row.bid))
					},
					eid (h,params) {
						return h('span',this.mapGvarsText('employees','eid',params.row.eid,'ename')||'暂无主责任人')
					},
					customer_status_did (h,params) {						
						let result = this.labelDicts(params.row.customer_status_did,'customer_status') || '-'
						return h('span',result)
					},
					is_connect (h,params) {
						let spans = []
						let row = params.row
						let map_text = {0:'无效',1:'有效'}
						let text = spans.push(h('span',map_text[row.is_connect]))
						if(row.is_connect) {
							if(row.followup_did) {
								spans.push(h('span',` (${this.labelDicts(row.followup_did,'followup')})`))
							}
						}
						else {
							if(row.invalid_followup_did) {
								spans.push(h('span',` (${this.labelDicts(row.invalid_followup_did,'invalid_followup')})`))
							}
						}
						return h('div',spans)
					},
					content (h,params) {
						
						return h('Tooltip',{
							'class':'x-tooltip',
							props: {
								content: params.row.content
							}
						},[
							h('p',{
								'class': 'text-over-elips',
								style: {
									width: '150px'
								},
							},params.row.content)
						])						
					},
					is_promise (h,params) {
						let map = {0: '未诺到', 1: '诺到'}
						let styles = {0:'#ccc',1:'#060'}
						let children = []
						children.push(
							h('span',{style:{color:styles[params.row.is_promise]}},map[params.row.is_promise])
						)
						if(params.row.is_promise == 1){
							children.push(h('p',this.$filter('int_date')(params.row.promise_int_day)))
						}
						return h('div',children)
					},
					promise_int_day (h,params) {
						return h('span',this.$filter('int_date')(params.row.promise_int_day)||'-')
					},
					is_visit (h,params) {
						let map = {0: '未到访',1:'已到访'}
						let styles = {0:'#ccc',1:'#060'}
						let children = []
						children.push(
							h('span',{style:{color:styles[params.row.is_visit]}},map[params.row.is_visit])
						)
						if(params.row.visit_int_day > 0){
							children.push(h('p',this.$filter('int_date')(params.row.visit_int_day)))
						}
						return h('div',children)
					},
					visit_int_day (h,params) {
						return h('span',this.$filter('int_date')(params.row.visit_int_day)||'-')
					},
					intention_level (h,params) {
						return h('Rate',{
							props: {
								value: params.row.intention_level,
								disabled: true
							}
						})
					},
					create_time (h,params) {
						return h('span',params.row.create_time.substring(0,10))
					},
					next_follow_time (h,params) {	
						return h('span',params.row.next_follow_time||'待定')
					},
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'flist.edit'
					},
					follow_add: {
						title: '跟进',
						type: 'plus',
						per: 'flist.add'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'flist.delete'
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
					},
					follow_add (params) {
						this.$Modal.open('recruiting/following/follow-info-modal.vue',{
							on: {
								'on-success':() => {
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal
							.set('cu_id',params.row.cu_id)
							.set('customerInfo',params.row.customer||{})
							.show(util.sprintf('添加跟进记录【%s】',params.row.customer?params.row.customer.name:''))
						})
					},
					delete (params) {
						this.delInfo(params.row)
					}
				}
			}
		},
		watch: {
			'type_following': function (val) {				
				this.init_data()
			}
		},
		methods: {
			getPromiseRecord() {
				this.$Modal.open('dashboard/home/todaytrial/promise-more.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
                .then(modal=>{
                    modal.show('诺到记录')
                })
			},
			perScopeChange(value) {
	            this.type_following = value
	        },
			editInfo (row) {
				this.$Modal.open('recruiting/following/follow-info-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					let info = util.copy(row)
					if(info.promise_int_day) {
						info.promise_int_day = this.$filter('int_date')(info.promise_int_day)
					}
					modal
					.set('cu_id',row.cu_id)
					.set('info',info)
					.show(util.sprintf('编辑跟进记录【%s】',row.customer?row.customer.name:''),'edit')
				})
			},
			delInfo (row) {
				this.confirm('确认删除本次跟进吗？')
				.then(()=>{
					this.delete(row)	
				})
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			addInfo () {
				this.$Modal.open('recruiting/following/follow-info-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加跟进记录')
				})
			},			
			ok () {
				if(this.visit_int_day==''){
					this.$Message.error('请选择到访日期')
					return false
				}
				this.confirm_visit()
			},
			cancel () {
				this.visit_int_day = ''
				this.close()
			},
			visit (item) {
				this.active_item = item
				if(item.is_visit){
					this.confirm('确认取消到访?')
					.then(response=>{
						this.confirm_visit(item)
					})
				}else{
					this.show('请选择到访日期')
				}
			},
			confirm_visit () {
				let [params,active_item] = [{},this.active_item]
				params.is_visit = active_item.is_visit
				if(params.is_visit==0){
					params.is_visit = 1
					params.visit_int_day = this.visit_int_day	
				}				
				this.$rest('customer_follow_up/'+active_item.cfu_id).put(params)
				.success(data=>{
					this.$Message.success('操作成功')
					this.init_data()
					this.cancel()
				}).error(response=>{
					this.error(response.body.message||'操作失败')
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
								
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='is_connect'){
						if(property!=','&&property.length > 0){
							params[o] = util.sprintf('[IN,%s]',property.join(','))
						}												
					}
					else if(o=='create_time'||o=='next_follow_time'){
						if(property!=','&&property.length > 0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='is_promise'){
						if(property!=-1){
							params[o] = property
						}
					}
					else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				if(this.type_following=='my'){
					params.eid = this.eid$
				}
			}
		}
	}
</script>

<style lang="less">
	.x-tooltip{
		.ivu-tooltip-inner{
			white-space: normal !important;
		}
	}
</style>