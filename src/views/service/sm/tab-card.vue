<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form mt-3 row">
				<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>				
				<Form-item label="到期时段" prop="expire_condition" class="col-sm-6 col-md-3">
					<Select v-model="search_field.expire_condition">
						<Option v-for="(item,index) in expire_condition" :value="item.field" :key="index">{{item.label}}</Option>
					</Select>
				</Form-item>
				<Form-item label="当前余额" prop="balance" class="col-sm-6 col-md-3">
					<select-age v-model="search_field.balance"></select-age>
				</Form-item>
				<Form-item label="当前积分" prop="bonus" class="col-sm-6 col-md-3">
					<select-age v-model="search_field.bonus"></select-age>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<ButtonGroup class="ml-3">
                		<Button type="ghost" size="small" @click="cardHistory">余额变动记录</Button>
                		<Button type="ghost" size="small" @click="levelHistory">等级变动记录</Button>
                	</ButtonGroup>	           	
                </Col>
           </Row>				
		</div>	
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="card" @click="issueCard">发放会员卡</Button>	
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	ref="tableExcel"
		            	v-loading="'user_cards'" 
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
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectAge from 'c%/SelectAge.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			SelectAge,
			SelectStudent,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'user_cards',
				pk: 'uc_id',
				search_field: {
					sid: 0,
					expire_condition: '',
					balance: [],
					bonus: []
				},
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					card: {
						title: '会员卡',
						show: true
					},
					activate_begin_time: {
						title: '生效时间',
						show: true
					},
					activate_end_time: {
						title: '过期时间',
						show: true
					},
					init_bonus: {
						title: '初始积分',
						show: true						
					},
					init_balance: {
						title: '初始余额',
						show: true
					},
					init_level: {
						title: '初始等级',
						show: true
					},
					bonus: {
						title: '当前积分',
						show: true						
					},
					balance: {
						title: '当前余额',
						show: true
					},
					level: {
						title: '当前等级',
						show: true
					}
				},
				column_render: {
					sid (h,params) {
						let names = []
						if(params.row.user) {
							if(params.row.user.students) {
								names = params.row.user.students.map(_=>_.student_name)
							}
						}
						return h('span',names.join(','))
					},
					card (h,params) {
						let name = ''
						if(params.row.card_type) {
							name = params.row.card_type.card_name
						}
						return h('span',name)
					},
					activate_end_time (h,params) {
						let end = params.row.activate_end_time
						if(end == '-') {
							return h('span','不限制')
						}
						else{
							return h('span',end)
						}
					},
					init_level (h,params) {
						let define = params.row.card_type.card_define
						let level = params.row.init_level
						if(define.length >= level) {
							return h('span',define[level-1].name)
						}
						return h('span','卡片定义不满足')
					},
					level (h,params) {
						let define = params.row.card_type.card_define
						let level = params.row.level
						if(define.length >= level) {
							return h('span',define[level-1].name)
						}
						return h('span','卡片定义不满足')
					}
				},
				operation_keys: {
					charge: {
						title: '余额变动',
						type: 'cash',
						per: 'usercard.balance'
					},
					bonus: {
						title: '积分变动',
						type: 'pricetag',
						per: 'usercard.bonus'
					},
					upgrade: {
						title: '提升等级',
						type: 'arrow-up-c',
						per: 'usercard.upgrade'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'usercard.delete'
					}
				},
				operation_func: {
					charge(params) {
						this.change(0,params.row)
					},
					bonus(params) {
						this.change(1,params.row)
					},
					upgrade(params) {
						let row = params.row
						let extra = {
							level: row.level,
							uc_id: row.uc_id,
							card_name: row.card_type.card_name,
							op_eid: this.eid$,
							op_int_day: moment().format('YYYY-MM-DD')
						}
						this.$Modal.open('service/sm/tab-card/upgrade-modal.vue',{
							props: {
								extra:extra,
								levels:row.card_type.card_define
							},
							on: {
								'on-success':() => {
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal.show(util.sprintf('提升会员等级【%s】',this.getName(params.row)))
						})
					},
					delete(params) {
						this.confirm(util.sprintf('确定删除【%s】的会员卡【%s】?',this.getName(params.row),params.row.card_type.card_name))
						.then(() => {
							this.delete(params.row)
						})
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			change(type,row) {
				let extra = {
					btype:type,
					uc_id: row.uc_id,
					card_name: row.card_type.card_name,
					op_eid: this.eid$,
					op_int_day: moment().format('YYYY-MM-DD')
				}
				this.$Modal.open('service/sm/tab-card/change-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					},
					props: {
						btype: type,
						extra: extra
					}
				})
				.then(modal => {
					modal.show(util.sprintf('%s变动【%s】',type==0?'余额':'积分',this.getName(row)))
				})
			},
			getName(row) {
				let names = []
				if(row.user&&row.user.students){
					names = row.user.students.map(_=>_.student_name)
				}
				return names.join(',')
			},
			issueCard() {
				this.$Modal.open('service/sm/tab-card/issue-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('发放会员卡')
				})
			},
			cardHistory() {
				this.$Modal.open('service/sm/tab-card/card-history.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('余额变动记录')
				})
			},
			levelHistory() {
				this.$Modal.open('service/sm/tab-card/level-history.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('等级变动记录')
				})
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='balance'||o=='bonus') {
						let start = util.int(property[0])
						let end = util.int(property[1])
						if(start>=0&&end>0&&end>=start){
							params[o] = util.sprintf('[Between,%s,%s]',start,end)
						}						
					}else{
						if(property&&property!=-1){
							params[o] = property							
						}
					}
				}
				params.with = 'user.students,card_type'
			},
		}
	}
	
</script>

<style>
</style>