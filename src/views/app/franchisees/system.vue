<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="机构名称" prop="org_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.org_name" placeholder="机构名称"></Input>
				</Form-item>
				<Form-item label="开通时间" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
				<Form-item label="账号状态" prop="is_frozen" class="col-md-3 col-sm-6">
					<Select v-model="search_field.is_frozen">
						<Option :value="-1">不限</Option>
						<Option :value="item.value" v-for="item in status_list">{{item.label}}</Option>
					</Select>
				</Form-item>

				<Form-item label="到期日期" prop="expire_day" class="col-md-3 col-sm-6">
					<Select v-model="search_field.expire">
						<Option :value="1">一周过期</Option>
						<Option :value="2">一个月过期</Option>
						<Option :value="3">三个月过期</Option>
						<Option :value="4">已过期</Option>
					</Select>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="系统类型" prop="org_type" class="col-md-3 col-sm-6">
						<Select v-model="search_field.org_type">
							<Option :value="1">正式版</Option>
							<Option :value="2">督导沟通版</Option>
						</Select>
					</Form-item>
					<Form-item label="关联盟商资料" :label-width="100" prop="link" class="col-md-3 col-sm-6">
						<Select v-model="search_field.link">
							<Option :value="-1">不限</Option>
							<Option :value="0">未关联</Option>
							<Option :value="1">已关联</Option>
						</Select>
					</Form-item>	
				</template>						
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button> 
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button> 
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
					<export-button res="orgs" :params="params"></export-button>
                	<!-- <CheckboxGroup class="ml-3" v-model="search_field.is_init" style="display: inline-block;">
                		<Badge :count="wait_check_nums">
                			<Checkbox :label="0" :readonly="readOnly(0,'is_init')" style="margin-bottom: 0">待审核</Checkbox>
                		</Badge>
                		<Checkbox class="ml-2" :label="1" :readonly="readOnly(1,'is_init')">已开通</Checkbox>
                	</CheckboxGroup> -->
					<Checkbox class="ml-2" v-model="search_field.is_check" :true-value="1" :false-value="-1" @on-change="isCheckChange">待审核</Checkbox>
                	<div class="pull-right">
                        <per-scope per="franchisee.allSystem" @on-change="type_system = $event"></per-scope>
                   	</div>
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<!-- <Button type="primary" icon="plus" @click="add" v-per="'franchsystem.add'">创建系统</Button>      -->
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
				<div class="content-body">
			        <Table 
			        v-loading="'orgs'" 
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
	import Vue from 'vue'
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import OperationItems from './archive/operation-account.vue'
	
	Vue.component('system-operation',OperationItems)

	export default{
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			ExportButton
		},
		data () {
			return {
				rest_api: 'orgs',
				pk: 'og_id',
				search_field: {
					org_name: '',
					create_time: [],
					is_frozen: -1,
					link: -1,
					is_init: [0,1],
					expire: 0,
					is_check: -1
				},
				type_system: '',
				showIndex: false,
				wait_check_nums: 0,
				status_list: [{value:0,label:'已开启'},{value:1,label:'已锁定'}],
				column_keys: {
					operate: {
						title: '操作',
						width: 80
					},
					index: {
						type: 'index',
						title:'#',
	                    width: 60,
	                    align: 'center'
					},
					org_name: {
						title: '机构名称',
						show: true
					},
					org_type: {
						title: '系统类型',
						show: true
					},
					host:{
						title:'域名',
						width: 200,
						show:true
					},
					mobile: {
						title: '联系电话',
						show: true
					},
					account_num_limit: {
						title: '账号数上限',
						show: true
					},
					branch_num_limit: {
						title: '校区数上限',
						show: true
					},
					student_num_limit: {
						title: '学员数上限',
						show: true,
					},
					is_init: {
						title: '系统状态',
						show: true
					},
					is_frozen: {
						title: '账号状态',
						show: true
					},
					is_configed: {
						title: '是否配置',
						show: true
					},
					create_time:{
					    title:'开通时间',
						show:true
					},
					expire_day: {
						title: '到期日期',
						show: true
					}				
				},
				column_render: {
					operate(h,params) {
						return h('system-operation',{
							props: {
								info: params.row
							},
							on: {
								'on-success':() => {
									this.init_data()
								}
							}
						}) 
					},
					org_name(h,params) {
						return h('span',{
							attrs: {
								class:'x-a-link text-info cursor'
							},
							on: {
								click:()=>{
									this.edit(params)
								}
							}
						},params.row.org_name)
					},
					org_type(h,params) {
						return h('span',params.row.org_type == 1 ? '正式版' : '督导版')
					},
					is_configed(h,params) {
						if(params.row.is_configed == 1) {
							return h('span', {
								style: {
									color: '#006600'
								}
							}, '已配置')
						}
						else {
							return h('span', '未配置')
						}
					},
					host(h,params) {
						return h('span',util.sprintf('http://%s.%s',params.row.host,this.$store.state.user.info.product_url.split('//')[1]))
					},
					open_int_day (h,params) {
						let day = params.row.open_int_day
						if(day) {
							return h('span',this.$filter('int_date')(day))
						}else{
							return h('span','-')
						}
					},
					join_int_day (h,params) {
						let day = params.row.join_int_day
						if(day) {
							return h('span',this.$filter('int_date')(day))
						}else{
							return h('span','-')
						}
					},
					is_init (h,params) {
						let map = {0:['待审核','text-info'],1:['已开通','text-success']}
						return h('span',{
							class: map[params.row.is_init][1]
						},map[params.row.is_init][0])
					},
					is_frozen (h,params) {
                        let map = {
                        	0:['close-circled', '#ef0101','未开启'],
                        	1:['close-circled', '#999999','已锁定'],
                        	2:['checkmark-circled','#006600','已开启']
                        }
                        let result = 0
                        if(params.row.user) {
                        	if(params.row.user.status === 0) {
                        		result = 1
                        	}else{
                        		result = 2
                        	}
                        }
                        return h('div',[
                            h('Icon',{
                                props:{
                                    type: map[result][0],
                                    color: map[result][1]
                                }
                            }),
                            h('span',map[result][2])
                        ])
					},
					org_address (h,params) {
						let row = params.row,
							ssq = ''
                        if(row.province_id) {
                            ssq = this.ssqFormat(row.province_id,row.city_id,row.district_id)
                        }
                        return h('span',ssq+row.org_address)
					},
					expire_day (h,params) {
						let remain_days = moment(util.format_int_day(params.row.expire_day)).diff(moment(new Date()),'days'), 
							remain_days_label = h('p',{
								'class': remain_days>15?'text-success':'text-danger'
							},`剩余 ${remain_days} 天`);

						let rst = '';
						if(params.row.expire_day == 20391231) {
							rst = '无限期'
						}
						else {
							rst = this.$filter('int_date')(params.row.expire_day)
						}
						let expire_time = h('span',rst)
							
						if(remain_days<0) {
							remain_days_label = h('p',{
								class: 'text-danger'
							},`已过期 ${-remain_days} 天`)
						}
						if(!params.row.user) {
							return h('span','-')
						}

						if(params.row.expire_day == 20391231) {
							return h('div',[
								expire_time
							])
						}
						else {
							return h('div',[
								expire_time,
								remain_days_label
							])
						}
					}
				}
			}
		},
		watch: {
			'type_system': function (val) {
				this.init_data()
			}
		},
		methods: {
			isCheckChange() {
				this.init_data();
			},
			add() {
				this.$Modal.open('system/orgs/info-modal.vue',{
					on: {
						save: () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('创建校360系统','add'))
				})
			},
			edit(params) {
				let row = util.copy(params.row)
                let expire = row.expire_day
                if(expire!==0) {
                    row.expire_day = this.$filter('int_date')(expire)
                }
                delete row.create_time
                delete row.users

                this.$Modal.open('system/orgs/info-modal.vue',{
                	on: {
						save: () => {
							this.init_data()
						}
					}
                })
                .then(modal => {
                	modal
                	.set('info',{org:row})
                	.show(util.sprintf('编辑加盟商【%s】',row.org_name),'edit')
                })
			},
			orgConfig(row) {
				this.$Modal.open('system/orgs/config.vue@modal',{
					props: {
						id: row.og_id,
						name: row.org_name
					},
					on:{
						'success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('校360系统配置【%s】',row.org_name))
				})
			},
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			deal_data(data) {
				this.wait_check_nums = data.wait_check_nums 
				return data.list
			},
			resetSearch () {
				this.search_field.is_init = [0,1]
				this.$form('ref_search').reset()
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
					}else if(o=='link'){
						if(property==1) {
							params['fc_id'] = '[>,0]'
						}else if(property==0){
							params['fc_id'] = 0
						}
					}else if(o=='is_init'){
						if(property.length>0){
                            params[o] = util.sprintf('[In,%s]',property.join(','))
                        }
					}else{
						if(property!==''&&property!==-1){
							params[o] = property	
						}		
					}									
				}
				if(this.type_system=='my') {
					params.eid = this.eid$
				}
			}
		}
	}
</script>
