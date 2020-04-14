<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" placeholder="请选择学员"></select-student>
				</Form-item>
				<Form-item label="退费日期" prop="refund_int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.refund_int_day" 
						@on-change="search" 
						label="选择退费日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
				<Form-item label="收据编号" prop="bill_no" class="col-md-3 col-sm-6">
					<Input v-model="search_field.bill_no" placeholder="请输入收据编号"></Input>
				</Form-item>
				<Form-item label="经办人" prop="create_uid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.create_uid" mode="user" placeholder="请选择经办人"></select-employee>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="操作日期" prop="create_time" class="col-md-3 col-sm-6">
						<date-range-picker 
							v-model="search_field.create_time" 
							@on-change="search" 
							label="选择操作日期" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>					
					</Form-item>
					<Form-item label="退费项目" prop="type" class="col-sm-3 col-xs-6 mb-0">
	    				<Select v-model="search_field.refund_type">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="1">只有课时</Option>
	    					<Option :value="2">只有电子钱包余额</Option>
	    					<Option :value="3">部分课时部分余额</Option>
	    					<Option :value="4">包含电子钱包余额</Option>

	    				</Select>
	    			</Form-item>
	    			<Form-item label="扣款" prop="type" class="col-sm-3 col-xs-6 mb-0">
	    				<Select v-model="search_field.has_cut_amount">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="1">有扣款</Option>
	    					<Option :value="0">没有扣款</Option>
	    					
	    				</Select>
	    			</Form-item>
	    			<Form-item label="退费类型" prop="type" class="col-sm-3 col-xs-6 mb-0" v-if="enable_empty_refund">
	    				<Select v-model="search_field.refudn_mode">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="1">满课耗返优惠</Option>
	    					<Option :value="0">剩余课时退费</Option>
	    					
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
                	<export-button res="order_refunds" :params="params"></export-button>
                	<Button type="ghost" class="ml-4" @click="checkCutHistory">扣款记录</Button>
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
			        v-loading="'order_refunds'" 
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
	            			退费{{label_currency}}{{total_refund_amount}},扣款{{label_currency}}{{total_cut_amount}}
	            			
	            		</span>	
	            		<span class="ml-3">本页小计:
	            			退费{{label_currency}}{{page_refund_amount}},扣款{{label_currency}}{{page_cut_amount}}
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
	</div>
</template>

<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [common,globals,grid],
		components: {
			SelectStudent,
			SelectEmployee,
			DateRangePicker,
			ExportButton
		},
		data () {
			return {
				total_refund_amount:0,
				total_cut_amount:0,
				total_refund_balance_amount:0,
				page_refund_amount:0,
				page_cut_amount:0,
				page_refund_balance_amount:0,
				rest_api: 'order_refunds',
				search_field: {
					sid:0,
					create_time:[],
					refund_int_day:[],
					bill_no:'',
					create_uid:0,
					refund_type:-1,
					has_cut_amount:-1,
					refund_mode:-1
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
					sid: {
						title:'学员',
						show:true
					},
					refund_int_day:{
						title:'退费日期',
						show:true,
						sortable:'custom'
					},
					bill_no:{
						title:'退费单号',
						show:true
					},
					refund_amount:{
						title:'退费金额',
						show:true,
						sortable:'custom'
					},
					refund_item:{
						title:'退费项目',
						show:true,
						width:250
					},
					refudn_mode:{
						title:'退费类型',
						show:true
					},
					cut_amount:{
						title:'扣款',
						show:true
					},
					refund_account:{
						title:'退费账户',
						show:true
					},
					refund_receipt:{
						title:'退费业绩归属',
					},
					create_time:{
						title:'操作日期',
						show:true,
						sortable:'custom'
					},
					create_employee:{
						title:'经办人',
						show:true,
						width:120
					}
				},
				column_render:{
					sid(h,params) {
						return h('span',params.row.student.student_name)
					},
					bill_no(h,params){
						return h('a',{
							attrs:{
								class:'x-a-link text-info'
							},
							on:{
								click:() => {
									this.showDetail(params.row)
								}
							}
						},params.row.bill_no)
					},
					refudn_mode(h,params){
						let text = '剩余课时退费'
						if(params.row.refund_mode == 1){
							text = '满课耗返优惠'
						}
						return h('span',text)
					},
					refund_item(h,params) {
						let result = []
						let items = params.row.order_refund_item
						if(params.row.refund_mode == 0){
							if(items.length > 0) {
								items.forEach(item => {
									let nums = ''
									let present = Number(item.present_nums)
									if(present > 0) {
										nums = h('span',{
											'class':'pull-right'
										},`x ${util.float(item.nums)}(+${present})`)
									}else{
										nums = h('span',{
											'class':'pull-right'
										},`x ${util.float(item.nums)}`)
									}
									
									result.push(h('p',[item.order_item.item_name,nums]))
								})
							}
						}else{
							result.push(h('p',params.row.refund_int_month))
							if(items.length > 0) {
								items.forEach(item => {
									
									let amount = h('span',{
										'class':'pull-right'
									},`返 ${util.float(item.amount)}`)
									
									
									result.push(h('p',[item.order_item.item_name,amount]))
								})
							}
						}
						if(params.row.refund_balance_amount > 0){
							result.push(h('p','电子钱包余额:'+this.label_currency+params.row.refund_balance_amount))
						}
						return h('div',result)
					},
					refund_int_day(h,params) {
						return h('span',this.$filter('int_date')(params.row.refund_int_day))
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					},
					cut_amount(h,params) {
						let result = []
						let cuts = params.row.order_cut_amount
						if(cuts.length > 0) {
							cuts.forEach(item => {
								result.push(h('p',`${this.labelDicts(item.cutamount_did,'cutamount')}:${this.label_currency}${item.amount}`))
							})
							return h('div',result)
						}else{
							return h('span','-')
						}
					},
					refund_account(h,params) {
						let accounts = this.$store.state.gvars.accounts,
							items = params.row.order_refund_history,
							result = []
						if(params.row.refund_to == 0){
							result.push(h('p','退到电子钱包'))
						}else{
							if(items.length>0){
								items.forEach(i=>{
									if(i.amount > 0){
										result.push(h('p',accounts.find(a=>a.aa_id==i.aa_id).name+':'+i.amount))
									}
								})
							}
						}

						return h('div',result)
					},
					refund_receipt(h,params) {
						let result = [], er = params.row.employee_receipts
						if(er.length > 0) {
							er.forEach(item => {
								result.push(h('p',this.$filter('ename')(item.eid)+'-'+this.labelDicts(item.sale_role_did,'sale_role')))
							})
						}
						return h('div',result.length>0?result:'-')
					},
					create_employee(h,params) {
						return h('span',params.row.employee?params.row.employee.ename:'-')
					}
				},
				operation_keys: {
					print: {
						title: '打印收据',
						type: 'printer',
						per: 'refund.print'
					},
					del: {
						title: '撤销退费',
						type: 'ios-undo',
						per: 'refund.undo'
					}
				},
				operation_func: {
					print(params) {
						this.print(2,params.row.or_id)
					},
					del(params) {
						this.undoRefund(params.row)
					}
				}
			}
		},
		created(){
			if(!this.enable_empty_refund){
				delete this.column_keys['refund_mode']
			}
			if(!this.enable_project){
				delete this.column_keys['pj_id']
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			checkCutHistory() {
				this.$Modal.open('business/iae/cut-history.vue@modal')
				.then(modal => {
					modal.show('扣款记录')
				})
			},
			undoRefund(row) {
				this.confirm('确定要撤销退费吗？')
				.then(() => {
					this.$rest('order_refunds')
					.delete(row.or_id)
					.success(res => {
						this.$Message.success('撤销成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'||o=='refund_int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'student'
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			deal_data(data){
				this.total_refund_amount = data.total_refund_amount
				this.total_cut_amount = data.total_cut_amount
				this.total_refund_balance_amount = data.total_refund_balance_amount
				this.page_refund_amount = data.page_refund_amount
				this.page_cut_amount = data.page_cut_amount
				this.page_refund_balance_amount = data.page_refund_balance_amount
				return data.list
			},
			showDetail(row) {
				this.$Modal.open('business/iae/refund-info.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('or_id',row.or_id)
					.show(util.sprintf('退费详情【%s】',row.student.student_name))
				})
			}
		}
	}
</script>
