<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="机构名称" prop="org_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.org_name" placeholder="机构名称"></Input>
				</Form-item>
				<Form-item label="创建时间" prop="create_time" class="col-md-3 col-sm-6">
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
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>  
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="plus" @click="add" v-per="'orgs.add'">新增加盟商</Button>            
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
	
	export default{
		mixins: [grid,common,globals],
		components: {
			dateRangePicker
		},
		data () {
			return {
				rest_api: 'orgs',
				pk: 'og_id',
				search_field: {
					org_name: '',
					create_time: [],
					is_frozen: -1,
				},
				status_list: [{value:0,label:'已开启'},{value:1,label:'已锁定'}],
				column_keys: {
					org_name: {
						title: '机构名称',
						width: 150,
						fixed: 'left',
						show: true
					},
					host:{
						title:'域名',
						width: 200,
						show:true
					},
					mobile: {
						title: '联系电话',
						width: 120,
						show: true
					},
					org_short_name: {
						title: '机构简称',
						width: 160,
						show: false
					},
					account_num_limit: {
						title: '账号数上限',
						width: 120,
						show: true
					},
					branch_num_limit: {
						title: '校区数上限',
						width: 120,
						show: true
					},
					student_num_limit: {
						title: '学员数上限',
						width: 120,
						show: true,
					},
					org_address: {
						title: '详细地址',
						show: true,
						width: 200
					},
					is_frozen: {
						title: '账号状态',
						width: 120,
						show: true
					},
					join_int_day: {
						title: '加盟日期',
						width: 120,
						show: true
					},
					open_int_day: {
						title: '开业日期',
						width: 120,
						show: true
					},
					expire_day: {
						title: '到期日期',
						width: 120,
						show: true
					}				
				},
				operation_keys: {
                    edit: {
                        title: '编辑',
                        type: 'edit',
                        per: 'orgs.edit'
                    },
                    config: {
                    	title: '配置',
                    	type: 'ios-gear',
                    	per: 'orgs.config'
                    },
                    renew: {
						title: '续费延期',
						type: 'calendar',
						per: 'orgs.renew',
						condition: 'row.is_frozen==0'
					},
					users_account: {
						title: '员工账号',
						type: 'ios-people',
//						per: 'orgs.users_acocunt'
					},
                    lock: {
                    	title: '锁定账号',
                    	type: 'minus-circled',
                    	condition: 'row.is_frozen==0',
                    	per: 'orgs.lock'
                    },
                    unlock: {
                    	title: '解锁账号',
                    	type: 'person-add',
                    	per: 'orgs.unlock',
                    	condition: 'row.is_frozen==1'
                    },
                    edit_account: {
                    	title: '修改账号',
                    	type: 'ios-refresh',
                        per: 'orgs.reset',
                        condition: 'row.is_frozen==0'
                    },
                    del: {
                        title: '删除',
                        type: 'ios-trash',
                        per: 'orgs.delete'
                    }
                },
				operation_func: {
					renew(params) {
						this.$Modal.open('system/orgs/renew.vue@modal',{
							on: {
								save: () => {
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal
							.set('info',params.row)
							.show(util.sprintf('续费延期:%s',params.row.org_name),'renew')
						})
					},
					edit(params) {
						this.edit(params)
					},
					config(params) {
						this.orgConfig(params.row)
					},
					del(params) {
						this.confirm(util.sprintf('您确定要删除加盟商【%s】吗?',params.row.org_name))
                        .then(()=>{
                            this.delete(params.row)
                            .then((response)=>{
                                this.$Message.success('删除成功!')
                            })
                        })   
					},
					users_account (params) {
						this.$Modal.open('system/orgs/org-users-modal.vue')
						.then(modal=>{
							modal
							.set('og_id',params.row.og_id)
							.show(`【${params.row.org_name}】员工账号`,'add')
						})
					},
					lock(params) {
						this.confirm(util.sprintf('您确定要锁定加盟商【%s】吗?',params.row.org_name))
						.then(()=>{
							this.$rest('orgs/'+params.row.og_id+'/dofreeze')
							.post()
							.success(response=>{
								this.init_data()
								this.$Message.success('锁定成功')
							})
							.error(response=>{
								this.error(response.body.message)
							})
						})
					},
					unlock(params) {
						this.confirm(util.sprintf('您确定要解锁加盟商【%s】吗?',params.row.org_name))
						.then(()=>{
							this.$rest('orgs/'+params.row.og_id+'/dounfreeze')
							.post()
							.success(response=>{
								this.init_data()
								this.$Message.success('解锁成功')
							})
							.error(response=>{
								this.error(response.body.message)
							})
						})
					},
					edit_account(params) {
						if(!params.row.user) {
							this.$Message.error('加盟商账号已被删除')
							return false;
						}
                        let param = {
                            account: params.row.user.account,
                            password: ''
                        }
						this.$Modal.open('system/staff/employee/account-modal.vue',{
							props: {
								'employee': util.copy(params.row.user),
								'mode': 'org'
							},
							on: {
								save: () => {
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal
							.set('info',param)
							.show(util.sprintf('修改账号:%s',params.row.org_name),'edit')
						})
					}					
				},
				column_render: {
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
					host(h,params) {
						return h('span',util.sprintf('http://%s.%s',params.row.host,this.$store.state.user.info.product_url.split('//')[1]))
					},
					expire_day (h,params) {
						return this.$filter('int_date')(params.row.expire_day)
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
					is_frozen (h,params) {
                        let [type,color,label] = ( params.row.is_frozen === 1 ? ['close-circled', '#999999','已锁定'] : ['checkmark-circled','#006600','已开启'])                   
                        
                        return h('div',[
                            h('Icon',{
                                props:{
                                    type: type,
                                    color: color
                                }
                            }),
                            h('span',label)
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
							},`剩余 ${remain_days} 天`), 
							expire_time = h('span',this.$filter('int_date')(params.row.expire_day)) 
							
						if(remain_days<0) {
							remain_days_label = h('p',{
								class: 'text-danger'
							},`已过期 ${-remain_days} 天`)
						}
						return 	h('div',[
							expire_time,
							remain_days_label
						])
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			add() {
				this.$Modal.open('system/orgs/info-modal.vue',{
					on: {
						save: () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('添加加盟商','add'))
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
					modal.show(util.sprintf('加盟商配置【%s】',row.org_name))
				})
			},
			resetSearch () {
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
					}else{
						if(property!==''&&property!==-1){
							params[o] = property	
						}		
					}									
				}
			}
		}
	}
</script>
