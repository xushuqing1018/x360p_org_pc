<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item label="储值卡名称" prop="card_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.card_name" clearable placeholder="请输入卡名称"></Input>
				</Form-item>
				<Form-item label="创建日期" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search" 
						placement="right-start" 
						style="width: 100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="创建人" prop="create_uid" class="col-md-3 col-sm-6">
    				<select-employee mode="user" v-model="search_field.create_uid" :clearable="true"></select-employee>
    			</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                </Col>
          	</Row>
		</div>
		<div class="box box-result">
			 <div class="toolbar">
	        	<Button type="primary" icon="plus" @click="addDebitCard" v-per="'debit_card.add'">添加储值卡</Button>
	        	<filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'debit_cards'" 
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
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
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee  from 'c%/SelectEmployee.vue' 
	export default {
		mixins: [common,globals,grid],
		components: {
			DateRangePicker,
			SelectEmployee
		},
		data() {
			return {
				rest_api: 'debit_cards',
				pk: 'dc_id',
				search_field: {
					card_name: '',
					create_time: [],
					create_uid: 0
				},
				column_keys: {
					card_name: {
						title: '储值卡名称',
						show: true
					},
					amount: {
						title: '面额',
						show: true,
						sortable: 'custom'
					},
					expire_days: {
						title: '有效期天数',
						show: true
					},
					upgrade_vip_level: {
						title: '会员等级',
						show: true
					},
					discount_define: {
						title: '折扣定义',
						show:true,
						width: 220
					},
					dpt_ids: {
						title: '适用范围',
						show: true,
						width: 220
					},
					create_time: {
						title: '创建日期',
						show: true,
						sortable: 'custom'
					},
					create_employee_name: {
						title: '创建人',
						show: true
					}
				},
				column_render: {
					amount(h,params) {
						const yen = this.label_currency
						return h('div',{
							style: {
								fontSize: '14px',
								fontWeight: 600
							}
						},[yen,params.row.amount])
					},
					expire_days(h,params) {
						let result = ''
						if(params.row.expire_days === 0) {
							result = '不限制'
						}else{
							result = params.row.expire_days + '天'
						}
						return h('span',result)
					},
					upgrade_vip_level(h,params) {
						let level = params.row.upgrade_vip_level
						if(level > 0) {
							return h('span',this.vip_level_config[level].name)
						}else{
							return h('span','-')
						}
					},
					discount_define(h,params) {
						let define = params.row.discount_define
						let result = []
						define.forEach(d => {
							if(d.discount_type === 1) {
								result.push(h('p',{
									style: {
										color: '#999',
										lineHeight: 1.8
									}
								},`${d.name}, 折扣${d.discount_rate}%`))
							}else if(d.discount_type === 2) {
								result.push(h('p',{
									style: {
										color: '#999',
										lineHeight: 1.8
									}
								},`${d.name}, 直减${d.reduced_amount}元`))
							}else{
								result.push(h('p',{
									style: {
										color: '#999',
										lineHeight: 1.8
									}
								},`${d.name}, 原价${d.origin}元,现价${d.current}元`))
							}
						})
						return h('div',{
							style: {

							}
						},result)
					},
					dpt_ids(h,params) {
						let bids = params.row.bids
						let dpt_ids = params.row.dpt_ids
						let result = []
						if(bids.length > 0 || dpt_ids.length > 0) {
							bids.forEach(b => {
								result.push(this.$filter('branch_name')(b))
							})
							dpt_ids.forEach(d => {
								result.push(this.$filter('dpt_name')(d))
							})
						}else{
							result.push('不限制')
						}
						return h('div',result.join(', '))
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'debit_card.edit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'debit_card.delete'
					}
				},
				operation_func: {
					edit(params) {
						let info = util.copy(params.row)
						info.amount = Number(info.amount)
						info.bids = info.bids.map(b => util.int(b))
						this.$Modal.open('system/basic/debit/info-modal.vue',{
							on: {
								save:() => {
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal.set('info',info).show('编辑储值卡','edit')
						})
					},
					delete(params) {
						this.confirm(util.sprintf('确定删除储值卡【%s】吗？',params.row.card_name))
						.then(() => {
							this.delete(params.row)
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			addDebitCard() {
				this.$Modal.open('system/basic/debit/info-modal.vue',{
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加储值卡','add')
				})
			},
	        hook_get_param(params){
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{		
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
	}
</script>