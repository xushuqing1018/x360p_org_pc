<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student :clearable="true" v-model="search_field.sid" placeholder="请选择学员"></select-student>
				</Form-item>
				<Form-item label="报名时间" prop="paid_time" class="col-md-3 col-sm-6">
					<date-range-picker
							v-model="search_field.paid_time"
							@on-change="search"
							label="选择日期"
							placement="bottom"
							style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="订单状态" prop="order_status" class="col-md-3 col-sm-6">
					<Select v-model="search_field.order_status">
						<Option :value="-1">不限</Option>
						<Option :value="item.value" v-for="item in status_list">{{item.label}}</Option>
					</Select>
				</Form-item>
				<Form-item label="付款状态" prop="pay_status" class="col-md-3 col-sm-6">
					<Select v-model="search_field.pay_status">
						<Option :value="-1">不限</Option>
						<Option :value="item.value" v-for="item in pay_status_map">{{item.label}}</Option>
					</Select>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="订单编号" prop="order_no" class="col-md-3 col-sm-6">
						<Input v-model="search_field.order_no" placeholder="请输入订单号" @keyup.native.enter="search"></Input>
					</Form-item>
					<Form-item label="下单时间" prop="create_time" class="col-md-3 col-sm-6">
						<date-range-picker
								v-model="search_field.create_time"
								@on-change="search"
								label="选择日期"
								placement="bottom"
								style="width:100%">
						</date-range-picker>
					</Form-item>
                    <Form-item label="订单类型" prop="is_import" class="col-md-3 col-sm-6">
				    	<Select v-model="search_field.is_import">
				    		<Option :value="-1">不限</Option>
				    		<Option :value="0">手工录入</Option>
                            <Option :value="1">导入</Option>
				    	</Select>
				    </Form-item>
					<!--<Form-item label="分班状态" prop="ac_status" class="col-md-3 col-sm-6">
						<Select v-model="search_field.ac_status">
							<Option :value="-1">不限</Option>
							<Option :value="item.value" v-for="item in ac_status_map">{{item.label}}</Option>
						</Select>
					</Form-item>-->
				</template>
				<!-- <Form-item label="收款账户" prop="aa_id" class="col-md-3 col-sm-6">
					<Select v-model="search_field.aa_id">
						<Option :value="-1">不限</Option>
						<Option :value="item.aa_id" v-for="item in accountList">{{item.name}}</Option>
					</Select>
				</Form-item> -->
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button> 
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
					<template v-if="enable_order_check">
	                	<CheckboxGroup v-model="search_field.is_check" class="ml-2" style="display: inline-block;">
	                		<Checkbox :label="1" :readonly="readOnly(1,'is_check')">已审核</Checkbox>
	                		<Checkbox :label="0" :readonly="readOnly(0,'is_check')">待审核</Checkbox>
	                	</CheckboxGroup>
	                </template>
                	<export-button 
                		res="orders" 
                		:params="params" 
                		:columns="column_keys" 
                		:disabled="disabled_export" 
                		:total="total" 
                		:max-sync-nums="1000"
                		>
            		</export-button>
            		
                	<div class="pull-right">
                        <per-scope per="order.all" @on-change="perScopeChange"></per-scope>
                    </div>
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar" v-if="orderFrom == 0">
				<Button type="info" @click="toSignup" icon="navigate" size="large" v-per="'dashboard.signup'">去报名</Button>
				<Button type="success" @click="toPayment" icon="navigate" size="large" v-per="'dashboard.payment'">去缴费</Button> 
				<import-button res="orders" name="报名" @on-import-finish="init_data" v-per="'offline.import'"></import-button>         
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
				<div class="content-body">
			        <Table 
			        v-loading.like="'orders?order_from'" 
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
	    <assign-class ref="assign_class" @on-success="init_order_data"></assign-class>
		<assign-teacher ref="assing_teacher" @on-success="init_order_data"></assign-teacher>
    </div>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import operationOrderItems from './operation-items.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import AssignClass from './assign-class.vue'
	import AssignTeacher from './assign-teacher.vue'

	import ExportButton from 'c%/ExportButton.vue'
	import ImportButton from 'c%/ImportButton.vue'
	
	Vue.component('operation-order-items',operationOrderItems)
	export default{
		mixins: [grid,common,globals],
		components: {
			operationOrderItems,
			dateRangePicker,
			SelectStudent,
			AssignClass,
			AssignTeacher,

			ExportButton,
			ImportButton
		},
		props: {
			orderFrom: {
				type: Number,
				default: 0
			}
		},
		data () {
			return {
				rest_api: 'orders?order_from='+this.orderFrom,
				pk: 'oid',
				showIndex: false,
				search_field: {
					order_no: '',
					create_time: [],
					paid_time: [],
					order_status: -1,
					sid: 0,
					pay_status: -1,
					ac_status: -1,
					is_check: [0,1],
                    is_import: -1
				},
				type_order: '',
				status_list: [
					{value:0,label:'待付款'},
					{value:1,label:'已付款'},
					{value:10,label:'已申请退款'},
					{value:11,label:'已退款'},
				],
				pay_status_map: [
					{value:0,label:'未缴清',color:'text-danger'},
					{value:1,label:'部分缴清',color:'text-danger'},
					{value:2,label:'已缴清',color:'text-success'}
				],
				ac_status_map: [
					{value:0,label:'未分班',color:'text-danger'},
					{value:1,label:'部分分班',color:'text-info'},
					{value:2,label:'已分班',color:'text-success'}
				],
				column_keys: {
					operate: {
						title: '操作',
						width: 80,
						show: true
					},
					row_number: {
						type: 'index',
						align: 'center',
						title: '#',
	                    width: 60,
	                    show: true
					},
					order_no: {
						title: '订单编号',
						show: true
					},
					create_time: {
						title: '下单时间',
						show: false,
						sortable:'custom'
					},
					bid: {
						title: '校区',
						show: true
					},
					pj_id:{
						title: '项目',
						show: false
					},
					sid: {
						title: '学员',
						show: true
					},
					items: {
						title: '项目',
						show: true,
						width: 200
					},
					order_amount: {
						title: '订单金额',
						show: true,
						sortable:'custom'
					},
					paid_amount: {
						title: '实缴金额',
						show: true,
						sortable:'custom'
					},
					order_status: {
						title: '订单状态',
						show: true
					},
					pay_status: {
						title: '付款状态',
						show: true
					},
					is_check: {
						title: '审核',
						show: true
					},
					/*ac_status: {
						title: '分班状态',
						show: false
					},*/
					paid_time: {
						title: '报名时间',
						show: true,
						sortable:'custom'
					},
					aa_id: {
						title: '支付方式',
						show: false
					},
					remark: {
						title: '备注',
						show: false
					}				
				},
				column_render: {
					operate (h,params) {
						let operate = [
									h('operation-order-items',{
										props: {
											info: params.row,
											refs: this.$refs
										},
										on: {
											refresh:() => {
												this.init_order_data()
											}
										}
									},
									[
										h('Button',{
											props: {
												type:'primary',
												size: 'small'
											}
										},[
											'操作  ',
											h('Icon',{
												props: {
													type: 'arrow-down-b'
												}
											})
										])
									])
								]
						return h('div',operate)
					},
					order_no (h,params) {
						return h('a',{
							attrs: {
								class: 'x-a-link text-info'
							},
							on: {
								click: ()=>{
									this.orderDetail(params.row.oid)									
								}
							}							
						},params.row.order_no)
					},
					sid (h,params) {
						let bid = params.row.student.bid,
							name = params.row.student.student_name
						if(bid !== params.row.bid) {
							name = util.sprintf('%s【%s】',name,this.$filter('branch_name')(bid))
						}
						return h('span',name)
					},
					order_status (h,params) {
						let order_status = params.row.order_status
						let map_status = {0:'待付款',1:'已付款',10:'已申请退款',11:'已退款'}
						let map_color = {0:'text-info',1:'text-success',2:'text-success',10:'text-danger',11:'text-danger'}
						let spans = []
						spans.push(map_status[order_status])
						if(order_status===11&&params.row.refund_amount) {
							spans.push(this.label_currency+params.row.refund_amount)
						}
						return h('span',{
								attrs:{
									class:map_color[order_status]
								}
							},spans)
					},
					pay_status (h,params) {
						let status_obj = this.pay_status_map.find(item=>item.value==params.row.pay_status)
						let div = []
						div.push(h('p',status_obj.label))
						if(params.row.pay_status==1) {
							div.push(h('p',`欠${params.row.unpaid_amount}元`))
						}
						return h('div',{
							attrs: {
								class: status_obj.color
							}
						},div)
					},
					ac_status (h,params) {
						let status_obj = this.ac_status_map.find(item=>item.value==params.row.ac_status)
						return h('span',{
							attrs: {
								class: status_obj.color
							}
						},status_obj.label)
					},
					items (h,params) {
						let items = params.row.order_items,
						result = []
						if(items.length>0){
							items.forEach(i=>{
								let child = []
								child.push(i.item_name)
								if(i.present_lesson_hours > 0){
									child.push(
										h('span',{class:'text-info pull-right'},'(+'+i.present_lesson_hours+')')
										)
								}
								let nums = h('span',{
									class: 'pull-right'
								},' x '+util.float(i.nums))
								child.push(nums)
								
								result.push(h('p',child))
							})
						}
						return h('div',result)
					},
					paid_time (h, params) {
						if(params.row.paid_time !== 0) {
							return h('span',params.row.paid_time)
						}
					},
					aa_id (h,params) {
						let items = params.row.order_items,
							result = []
						if(items.length>0){
							let bills = items[0].receipt_bill_item
							if(bills.length>0){
								bills.forEach(b => {
									let payment = b.order_payment_history
									if(payment.length>0){
										payment.forEach(p => {
											if(p.amount>0) {
												result.push(h('p',this.accounts$.find(a=>a.aa_id==p.aa_id).name+'：'+p.amount))
											}
										})
									}
								})
							}
						}
						if(params.row.balance_paid_amount>0) {
							result.push(h('p','余额付款：'+params.row.balance_paid_amount))
						}
						
						return h('span',result)
					},
					is_check(h,params) {
						let map = {0:['text-danger','待审核'],1:['text-success','已审核']}
						let checked = params.row.is_check
						if(checked) {
							let ps = []
							ps.push(h('p',{class: map[checked][0]},map[checked][1]))
							ps.push(h('p','审核人：'+this.$filter('ename')(params.row.check_eid)))
							ps.push(h('p',params.row.check_time))
							return h('div',ps)
						}
						else {
							return h('span',{
								class: map[checked][0]
							},map[checked][1])
						}
					}
				}
			}
		},
		watch: {
			'type_order':function(val) {
				this.init_order_data()
			},
			'search_field': {
	            handler:function(){
	                if(this.autoRefresh) {
	                    if(this.tId) {
	                        clearTimeout(this.tId)
	                    }
	                    this.tId = setTimeout(() => {
	                        this.init_order_data()
	                    },300)
	                }
	            },
	            deep: true
	        }
		},
		mounted() {
			this.replaceSearchField()
		},
		created(){
			if(!this.enable_empty_refund){
				delete this.column_keys['refund_amount']
			}
			if(!this.enable_project){
				delete this.column_keys['pj_id']
			}
			if(!this.enable_order_check){
				delete this.column_keys['is_check']
			}
		},
		beforeDestroy() {
	        this.setStateSearchDetail(false)
	    },
		methods: {
			init_order_data() {
				if(this.type_order === 'my') {
					if(this.search_field.sid == 0) {
						this.data = []
						this.$Message.info("在'我的订单'权限下只能通过学员查找到订单")
						return;
					}
				}
				this.init_data()
			},
			search() {
				this.pageIndex = 1
				this.init_order_data()
			},
			perScopeChange(value) {
	            this.type_order = value
	        },
			orderDetail (oid) {
				this.setStateSearchInfo()
				this.$router.push({path: '/business/order/'+oid})
			},
			resetSearch () {
				this.$form('ref_search').reset()
			},
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'||o=='paid_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='pay_status'){
						if(property>-1){
							params[o] = util.sprintf('[In,%s]',property)
						}
					}else if(o=='ac_status'){
						if(property>-1){
							params[o] = util.sprintf('[In,%s]',property)
						}
					}else if (o=='order_status'){
						if(property>-1) {
							params[o] = property
						}
					}else if (o=='is_check'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}else if (o=='is_import'){
						if(property>-1) {
							params[o] = property
						}
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.is_demo = 0
			},
			toSignup() {
				this.$router.push({path: '/dashboard/signup'})
			},
			toPayment() {
				this.$router.push({path: '/dashboard/payment'})
			}
		},
		computed: {
			accountList () {
				let list = [],
				accounts = this.accounts$,
				bid = this.bid$
				accounts.forEach(item => {
					if(!_.isEmpty(item.bids) && item.bids.indexOf(bid) > -1 && item.is_front == 1) {
						if(item.type != 0 || item.is_default != 1) {
							list.push(item)
						}
					}
					if(_.isEmpty(item.bids) && item.is_public == 1 && item.is_front == 1) {
						list.push(item)
					}
				})
				return list
			},
			disabled_export() {
				return this.data.length == 0 && this.type_order === 'my'
			}
		}
	}
</script>
