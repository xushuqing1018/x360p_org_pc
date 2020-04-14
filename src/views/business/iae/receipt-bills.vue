<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" placeholder="请选择学员"></select-student>
				</Form-item>
				<Form-item label="缴费日期" prop="paid_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.paid_time" 
						@on-change="search" 
						label="选择缴费日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
				<Form-item label="收据编号" prop="orb_no" class="col-md-3 col-sm-6">
					<Input v-model="search_field.orb_no" placeholder="请输入收据编号"></Input>
				</Form-item>
				<Form-item label="经办人" prop="create_uid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.create_uid" mode="user" placeholder="请选择经办人"></select-employee>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="录入日期" prop="create_time" class="col-md-3 col-sm-6">
						<date-range-picker 
							v-model="search_field.create_time" 
							@on-change="search" 
							label="选择录入日期" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>					
					</Form-item>
					<Form-item label="收款账户" prop="type" class="col-sm-3 col-xs-6 mb-0">
	    				<Select v-model="search_field.pay_type">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="1">余额付款</Option>
	    					<Option :value="2">非余额</Option>
	    					<Option :value="3">部分余额</Option>
	    				</Select>
	    			</Form-item>
	    			<Form-item label="支付方式" prop="aa_id" class="col-sm-3 col-xs-6 mb-0" v-if="search_field.pay_type != 1">
	    				<Select v-model="search_field.aa_id">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="item.aa_id" v-for="(item,index) in branch_accounts">{{item.name}}</Option>
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

                	<export-button res="order_receipt_bills" :params="params"></export-button>
                	<Checkbox class="ml-2" v-model="search_field.is_demo" :true-value="1" :false-value="0">体验课</Checkbox>
					<template v-if="enable_orb_check">
	                    <span class="ml-2 mr-2">|</span>
	                	<CheckboxGroup v-model="search_field.is_check" class="ml-2" style="display: inline-block;">
	                		<Checkbox :label="1" :readonly="readOnly(1,'is_check')">已审核</Checkbox>
	                		<Checkbox :label="0" :readonly="readOnly(0,'is_check')">待审核</Checkbox>
	                	</CheckboxGroup>
	                </template>
					<ButtonGroup class="ml-4">
	                	<Button @click="checkOnlinePayHistory">在线支付记录</Button>
	                	<Button @click="checkMoneyHistory">学员余额变动记录</Button>
	                </ButtonGroup>
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
			        v-loading="'order_receipt_bills?with=student,employee_receipt'" 
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
			    	<div class="pull-left">
	            		<span class="ml-3">总计:
	            			余额{{label_currency}}{{total_balance_paid_amount}},非余额{{label_currency}}{{total_money_paid_amount}}
	            			
	            		</span>	
	            		<span class="ml-3">本页小计:
	            			余额{{label_currency}}{{page_balance_paid_amount}},非余额{{label_currency}}{{page_money_paid_amount}}
	            		</span>
	            	</div>
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
		<receipt-bill-info ref="bill_info" @on-success="init_data"></receipt-bill-info>
		<online-pay ref="onlineModal" @on-query="queryOrderByOrbno"></online-pay>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ReceiptBillInfo from './receipt-bill-info.vue'
	import OnlinePay from './online-pay.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [common,globals,grid],
		components: {
			SelectStudent,
			SelectEmployee,
			DateRangePicker,
			ReceiptBillInfo,
			OnlinePay,

			ExportButton
		},
		data () {
			return {
				total_amount:0,
				page_amount:0,
				total_balance_paid_amount:0,
				total_money_paid_amount:0,
				page_balance_paid_amount:0,
				page_money_paid_amount:0,
				rest_api: 'order_receipt_bills?with=student,employee_receipt',
				search_field: {
					sid:0,
					paid_time:[],
					create_time:[],
					orb_no:'',
					create_uid:0,
					is_demo:0,
					is_check: [0,1]
				},
				column_keys: {
					bid: {
						title: '校区',
						show: false
					},
					pj_id:{
						title:'项目',
						show: false
					},
					student_name:{
						title:'学员',
						show:true
					},
					paid_time: {
						title:'缴费日期',
						show:true,
						sortable:'custom'
					},
					orb_no:{
						title:'收据编号',
						disabled:true,
						show:true
					},
					amount:{
						title:'缴费金额',
						show:true,
						sortable:'custom'
					},
					items:{
						title:'缴费项目',
						show:true,
						width: 250
					},
					pay_type:{
						title:'支付方式',
						show:true
					},
					order_remark:{
						title:'订单备注',
						width:100,
						show:false
					},
					is_check:{
						title: '审核状态',
						show: true
					},
					employee_receipt:{
						title:'回款业绩归属',
						show:true
					},
					create_time: {
						title:'录入日期',
						show:true,
						sortable:'custom'
					},
					manager:{
						title:'经办人',
						width:120,
						show:true
					}
				},
				column_render:{
					orb_no(h,params) {
						return h('a',{
							attrs:{
								class:'x-a-link text-info'
							},
							on:{
								click:() => {
									this.showDetail(params.row)
								}
							}
						},params.row.orb_no)
					},
					sno(h,params) {
						return h('span',params.row.student.sno||'-')
					},
					student_name(h,params) {
						let stutasMap = {
							1: '正常',
							20: '停课',
							30: '休学',
							50: '结课',
							90: '退学',
							100: '封存',
						};
						let status = params.row.student.status;
						let color = '';
						if(status == 1) {
							color = 'green'
						}
						else if(status == 20||30||50||90) {
							color = 'yellow'
						}
						else if(status == 100) {
							color = 'red'
						}
						let nameEl = h('span',params.row.student.student_name);
						let labelEl = h('Tag', {
							props: {
								color: color
							},
							style: {
								marginLeft: '10px'
							}
						}, stutasMap[status])
						return h('span', [nameEl, labelEl])
					},
					amount(h,params) {
						return h('span',this.label_currency+params.row.amount)
					},
					items(h,params) {
						let result = [],items = params.row.order_receipt_bill_item
						if(items.length>0){
							items.forEach(b=>{
								if(b.order_item) {
									if(b.order_item.gtype == 0||b.order_item.gtype == 1) {
										let nums = h('span',{
											'class':'pull-right'
										},`x ${util.float(b.order_item.nums)}`)
										result.push(h('p',[b.order_item.item_name,nums]))
									}else if(b.order_item.gtype == 2){					
										let text = '储值：'+b.order_item.subtotal+'元'
										if(b.order_item.present_amount > 0){
											text = '储值：'+b.order_item.subtotal+'元；赠送：'+b.order_item.present_amount+'元'
										}
										if(b.order_item.dc_id > 0){
											text = '购买储值卡:'+b.order_item.subtotal+'元'
										}
										result.push(h('p',text))

									}else{
										result.push(h('p',b.order_item.item_name))
									}
								}
							})
						}
						return h('div',result)
					},
					pay_type(h,params) {
						let accounts = this.$store.state.gvars.accounts,
							items = params.row.order_payment_history,
							result = []
						if(items.length>0){
							items.forEach(i=>{
								if(i.amount > 0){
									result.push(h('p',accounts.find(a=>a.aa_id==i.aa_id).name+':'+i.amount))
								}
							})
						}
						if(params.row.balance_paid_amount>0){
							result.push(h('p','余额付款:'+params.row.balance_paid_amount))
						}
						return h('div',result)
					},
					employee_receipt(h,params) {
						let result = [], er = params.row.employee_receipt
						if(er.length > 0) {
							er.forEach(item => {
								result.push(h('p',this.$filter('ename')(item.eid)+'-'+this.labelDicts(item.sale_role_did,'sale_role')))
							})
						}
						return h('div',result.length>0?result:'-')
					},
					manager(h,params) {
						return h('span',params.row.employee?params.row.employee.ename:'-')
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
				},
				operation_keys:{
					delete: {
						title: '作废',
						type: 'ios-trash',
						per: 'bills.invalid',
						condition: 'row.hw_id==0'
					},
					edit: {
						title: '修改收据号',
						type: 'edit',
						per: 'bills.edit'
					},
					paid_time: {
						title: '修改缴费日期',
						type: 'edit',
						per: 'bills.edit'
					},
					domnypay: {
						title: '改为余额支付',
						type: 'edit',
						per: 'bills.domnypay',
						condition: 'row.balance_paid_amount==0&&row.order_payment_history.length>0'
					},
					check: {
						title: '确认审核',
						type: 'checkmark',
						per: 'bills.check',
						condition: 'row.is_check==0'
					},
					uncheck: {
						title: '取消审核',
						type: 'close',
						per: 'bills.uncheck',
						condition: 'row.is_check==1'
					},
				},
				operation_func: {
					delete(params) {
						this.invalidReceipt(params.row)
					},
					edit(params) {
						this.editOrbNo(params.row)
					},
					paid_time(params) {
						this.editPaidTime(params.row)
					},
					domnypay(params) {
						this.confirm('确定改为余额支付吗？请确保余额足够')
						.then(() => {
							this.$rest('order_receipt_bills')
							.add_url_param(params.row.orb_id+'/domnypay')
							.post()
							.success(res => {
								this.$Message.success('修改成功')
								this.init_data()
							})
							.error(res => {
								this.error(res.body.message)
							})
						})
					},
					check(params) {
						this.doCheck(params.row.orb_id,1)
					},
					uncheck(params) {
						this.doCheck(params.row.orb_id,0)
					},
				}
			}
		},
		created () {
			if(!this.enable_project){
				delete this.column_keys['pj_id']
			}
			if(!this.enable_orb_check) {
				delete this.column_keys['is_check']
				delete this.operation_keys['check']
				delete this.operation_keys['uncheck']
			}
		
		},
		mounted () {
			this.init_data()
		},
		methods: {
			editPaidTime(row) {
				this.$Modal.open('business/iae/edit-paid-time.vue@modal',{
					on: {
						success:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					let info = {
						orb_id: row.orb_id,
						paid_time: row.paid_time
					}
					modal.set('info',info).show('修改缴费日期','edit')
				})
			},
			invalidReceipt(row) {
				this.confirm('收据作废之后将无法恢复，确定作废吗？')
				.then(() => {
					this.$rest('order_receipt_bills')
					.delete(row.orb_id)
					.success(res => {
						this.$Message.success('作废成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			editOrbNo(row) {
				this.$Modal.open('business/iae/edit-receipt-modal.vue',{
					on: {
						success:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					let info = {
						orb_id: row.orb_id,
						user_receipt_no: row.orb_no
					}
					modal.set('info',info).show('修改收据号','edit')
				})
			},
			showDetail(row) {
				this.$r('bill_info')
				.set('orb_id',row.orb_id)
				.show(util.sprintf('收据详情【%s】',row.student.student_name),'info')
			},
			checkOnlinePayHistory() {
				this.$Modal.open('business/iae/online-pay.vue@modal')
				.then(modal => {
					modal.show('在线支付记录')
				})
			},
			checkMoneyHistory() {
				this.$Modal.open('business/iae/money-history.vue@modal')
				.then(modal => {
					modal.show('学员余额变动记录')
				})
			},
			queryOrderByOrbno(no) {
				this.search_field.orb_no = no
				this.init_data()
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
					}else if (o=='is_check'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}												
					}else if(o=='is_demo'){
						params[o] = property
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
			},
			deal_data(data){
				this.total_amount = data.total_amount
				this.page_amount = data.page_amount
				this.total_money_paid_amount = data.total_money_paid_amount
				this.total_balance_paid_amount = data.total_balance_paid_amount
				this.page_money_paid_amount = data.page_money_paid_amount
				this.page_balance_paid_amount = data.page_balance_paid_amount
				return data.list
			},
			doCheck(id,type) {
				let [tip,action,msg] = type?['审核','docheck','审核成功']:['取消审核','douncheck','取消成功']
				this.confirm('确定'+tip+'此缴费记录吗？')
				.then(() => {
					this.$rest('order_receipt_bills')
					.add_url_param(id,action)
					.post({
						orb_id: id
					})
					.success(res => {
						this.$Message.success(msg)
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
		}
	}
</script>
