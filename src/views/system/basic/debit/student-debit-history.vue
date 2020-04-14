<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="状态" prop="is_used" class="col-md-3 col-sm-6">
					<Select v-model="search_field.is_used">
						<Option :value="-1">不限</Option>
						<Option :value="0">未使用</Option>
						<Option :value="1">部分使用</Option>
						<Option :value="2">已使用</Option>
					</Select>
				</Form-item>
				<Form-item label="来源" prop="buy_type" class="col-md-3 col-sm-6">
					<Select v-model="search_field.buy_type">
						<Option :value="-1">不限</Option>
						<Option :value="0">订单购买</Option>
						<Option :value="1">余额兑换</Option>
					</Select>
				</Form-item>
				<Form-item label="购买日期" prop="buy_int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.buy_int_day" 
						@on-change="search" 
						placement="right-start" 
						style="width: 100%">
					</date-range-picker>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="操作人" prop="create_uid" class="col-md-3 col-sm-6">
	    				<select-employee mode="user" v-model="search_field.create_uid" clearable></select-employee>
	    			</Form-item>
	    		</template>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                </Col>
          	</Row>
		</div>
		<div class="box box-result">
			 <div class="toolbar">
	        	<filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 		            	
		            	v-loading="'student_debit_cards'" 
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
	import SelectStudent from 'c%/SelectStudent.vue'
	export default {
		mixins: [common,globals,grid],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'student_debit_cards',
				pk: 'sdc_id',
				search_field: {
					sid: 0,
					is_used: -1,
					buy_int_day: [],
					create_uid: 0,
					buy_type: -1
				},
				column_keys: {
					student_name: {
						title: '学员',
						show: true
					},
					debit_card: {
						title: '储值卡',
						show: true
					},
					is_used: {
						title: '是否使用',
						show: true,
						sortable: 'custom'
					},
					remain_amount: {
						title: '剩余金额',
						show: true,
						sortable: 'custom'
					},
					buy_int_day: {
						title: '购买日期',
						show: true,
						sortable: 'custom'
					},
					expire_int_day: {
						title: '有效期至',
						show: true,
						sortable: 'custom'
					},
					buy_type: {
						title: '来源',
						show: true,
						sortable: 'custom'
					},
					create_employee_name: {
						title: '操作人',
						show: true
					}
				},
				column_render: {
					student_name(h,params) {
						let map = {0:'help',1:'male',2:'female'}
						return h('span',[
							map[params.row.sex],
							params.row.student.student_name
						])
					},
					debit_card(h,params) {
						let debit = params.row.debit_card
						let icon = this.label_currency
						return h('span',[
							debit.card_name,
							' (',
							icon,
							debit.amount,
							')'
						])
					},
					is_used(h,params) {
						let map = {0:'未使用',2:'已使用',1:'部分使用'}
						return h('span',{
							class: {
								'text-danger': params.row.is_used === 2
							}
						},map[params.row.is_used])
					},
					remain_amount(h,params) {
						let icon = this.label_currency
						return h('span',[
							icon,
							params.row.remain_amount
						])
					},
					buy_int_day(h,params) {
						let buy = params.row.buy_int_day
						if(buy!=0 && buy!=19700101) {
							return h('span',this.$filter('int_date')(buy))
						}
						return h('span','-')
					},
					buy_type(h,params) {
						let map = {0:'订单购买',1:'余额兑换'}
						return h('span',map[params.row.buy_type])
					},
					expire_int_day(h,params) {
						let expire = params.row.expire_int_day,
							expire_date = this.$filter('int_date')(expire),
							remain_days = moment(String(expire)).diff(moment(),'days'),
							remain_label = ''
						if(remain_days>=0) {
							remain_label = h('p',{
								class: remain_days>15?'text-success':'text-danger'
							},`剩余 ${remain_days} 天`)
						}else{
							remain_label = h('p',{
								class: 'text-danger'
							},'已过期')
						}
						if(expire!=0 && expire!=19700101) {
							return h('div',[
								expire_date,
								remain_label
							])
						}
						return h('span','不限制')
					}
				},
				operation_keys: {
					print: {
						title: '打印合同',
						type: 'printer',
						per: 'debit_card_history.print',
						condition: 'row.buy_type==0'
					},
					edit: {
						title: '修改有效期',
						type: 'edit',
						per: 'debit_card_history.edit'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'debit_card_history.delete'
					}
				},
				operation_func: {
					print(params) {
						this.print(params.row.smh_id)
					},
					edit(params) {
						this.editExpireDay(params.row)
					},
					del(params) {
						this.confirm(util.sprintf('确定要删除【%s】购买的储值卡【%s】吗？',
							params.row.student.student_name,params.row.debit_card.card_name))
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
	        hook_get_param(params){
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='buy_int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='buy_type'){
						if(property!=-1) {
							params[o] = property
						}
					}else{			
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				params.with = 'student,debit_card'
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			print(id) {
				this.showPageSpin('正在获取打印模板...')
				this.$rest('student_money_historys/print?smh_id='+id)
				.get()
				.success(data=>{
					this.printer.printBill(4,data,1,'0 0 0 0',true)
					this.hidePageSpin()
				}).error(body=>{
					this.hidePageSpin()
					this.$Notice.error({
						title: '错误',
						desc: body.message||'获取打印数据错误'
					})
				})
			},
			editExpireDay(row) {
				this.$Modal.open('system/basic/debit/modify-expire-modal.vue',{
					props: {
						info: row 
					},
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('修改学员储值卡有效期')
				})
			}
		}
	}
</script>