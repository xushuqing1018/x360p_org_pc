<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="流水日期" prop="int_day" class="col-sm-3 col-xs-6 mb-0">
    				<date-range-picker 
    					v-model="search_field.int_day" 
    					@on-change="search"
    					style="width:100%">
    				</date-range-picker>
    			</Form-item>
    			<Form-item label="账户" prop="aa_id" class="col-sm-3 col-xs-6 mb-0">
    				<Select v-model="search_field.aa_id">
    					<Option :value="-1">不限</Option>
    					<Option v-for="(item,index) in accounts" :value="item.aa_id" :key="index">{{item.name}}</Option>
    				</Select>
    			</Form-item>
    			<Form-item label="收支大类" prop="type" class="col-sm-3 col-xs-6 mb-0">
    				<Select v-model="search_field.type" @on-change="search_field.cate=-1">
    					<Option :value="-1">不限</Option>
    					<Option :value="1">进账</Option>
    					<Option :value="2">出账</Option>
    				</Select>
    			</Form-item>
    			<Form-item label="收支小类" prop="cate" class="col-sm-3 col-xs-6 mb-0" v-show="search_field.type==1">
    				<Select v-model="search_field.cate" v-if="search_field.type==1">
    					<Option :value="-1">不限</Option>
    					<Option :value="1">收入</Option>
    					<Option :value="4">应收</Option>
    				</Select>
    			</Form-item>
    			<Form-item label="收支小类" prop="cate" class="col-sm-3 col-xs-6 mb-0" v-show="search_field.type==2">
    				<Select v-model="search_field.cate" v-if="search_field.type==2">
    					<Option :value="-1">不限</Option>
    					<Option :value="2">支出</Option>
    					<Option :value="3">转账</Option>
    					<Option :value="5">应付</Option>
    				</Select>
    			</Form-item>
    			
    			<Form-item label="经办人" prop="create_uid" class="col-sm-3 col-xs-6 mb-0">
    				<select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
    			</Form-item>
    			<template v-if="searchExpand">
    				<Form-item label="操作日期" prop="create_time" class="col-sm-3 col-xs-6 mb-0">
	    				<date-range-picker 
	    					v-model="search_field.create_time" 
	    					@on-change="search"
	    					style="width:100%">
	    				</date-range-picker>
	    			</Form-item>
	    			<Form-item label="核算人员" prop="employee_th_id" class="col-sm-3 col-xs-6 mb-0" v-if="employee_help.length">
	    				<Select v-model="search_field.employee_th_id">
	    					<Option :value="item.th_id" v-for="item in employee_help">{{item.name}}</Option>
	    				</Select>
	    			</Form-item>
    			</template>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">   
                	<ButtonGroup>
	                	<Button type="primary" icon="ios-search" @click="search">查询</Button>
	                	<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
	                </ButtonGroup>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                    <export-button res="tallys" :params="params"></export-button>
                    <Checkbox class="ml-2" v-model="search_field.is_demo" :true-value="1" :false-value="0">体验课</Checkbox>
                    <template v-if="enable_tally_check">
	                    <span class="ml-2 mr-2">|</span>
	                	<CheckboxGroup v-model="search_field.is_check" class="ml-2" style="display: inline-block;">
	                		<Checkbox :label="1" :readonly="readOnly(1,'is_check')">已审核</Checkbox>
	                		<Checkbox :label="0" :readonly="readOnly(0,'is_check')">待审核</Checkbox>
	                	</CheckboxGroup>
	                </template>
                </Col>
           	</Row>
    	</div>
    	
    	<div class="box box-result">
    		<div class="toolbar">	
    			<Button type="primary" icon="plus" v-per="'tally.add'" @click="addInfo">
    				记一笔
    				<tally-info ref="info" @on-success="init_data"></tally-info>
    			</Button>
				<filter-column :keys="column_keys"></filter-column>
			</div>
    		<div class="content">
    			<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'tally'" 
		            	ref="tableExcel"
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
	            	<div class="pull-left">
	            		<span class="ml-3">收入：
	            			<span style="color:red">{{label_currency}}{{amount.income}}</span>
	            		</span>
	            		<span class="ml-3">支出：
	            			<span style="color:#0c6">{{label_currency}}{{amount.payout_amount}}</span>
	            		</span>
	            		<span class="ml-3">合计：
	            			<span style="color:red">{{label_currency}}{{amount.diff}}</span>
	            		</span>	
	            	</div>
	            	
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
	import Vue from 'vue'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import tallyInfo from './tally-info.vue'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,directive,common,globals],
		components: {
			tallyInfo,
			dateRangePicker,
			SelectEmployee,
			ExportButton
		},
		data () {
			return {
				rest_api: 'tallys',
				pk: 'tid',
				search_field: {
					aa_id: -1,
					type: -1,
					int_day: [],
					is_demo: 0,
					cate: -1,
					create_time: [],
					create_uid: 0,
					is_check: [0,1],
					employee_th_id: 0
				},
				amount: {
					income: 0,
					payout_amount: 0,
					diff: 0
				},
				column_keys: {
					int_day: {
						title: '流水日期',
						show: true,
						sortable:'custom'
					},	
					bid: {
						title: '校区',
						show: true
					},
					pj_id:{
						title:'项目',
						show: false
					},
					aa_id: {
						title: '账户',
						show: true
					},		
					amount:{
						title: '金额',
						show: true
					},
					present_amount:{
                        title: '赠送金额',
                        show:false
					},
					real_amount:{
						title: '实收金额',
						show: false
					},
					student_name: {
						title: '学员姓名',
						show: true
					},					
					remark: {
						title: '备注',
						show: true						
					},
					tt_id: {
						title: '收支类别',
						show: false
					},
					client_th_id: {
						title: '单位',
						show: false
					},
					employee_th_id: {
						title: '核算人员',
						show: false
					},
					is_check: {
						title: '审核',
						show: true
					},
					create_time: {
						title: '操作日期',
						show: true,
						sortable:'custom'
					},
					create_eid: {
						title: '操作人',
						show: true
					},
					item_th_id: {
						title: '项目',
						show: false
					},
					relate_id: {
						title: '收据号',
						show: false
					},					
					sno: {
						title: '学号',
						show: false
					},
					to_aa_id: {
						title: '对方账户',
						show: false
					},
					tally_file: {
						title: '附件',
						show: false,
						width: 100
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'tally.edit'
					},
					check: {
						title: '确认审核',
						type: 'checkmark',
						per: 'tally.check',
						condition: 'row.is_check==0&&1=='+this.$store.state.gvars.configs.params.iae.enable_tally_check
					},
					uncheck: {
						title: '取消审核',
						type: 'close',
						per: 'tally.check',
						condition: 'row.is_check==1&&1=='+this.$store.state.gvars.configs.params.iae.enable_tally_check
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						condition: 'row.relate_id==0||row.is_check==0',
						per: 'tally.delete'
					}
				},
				operation_func: {
					edit(params) {
						this.editInfo(params.row)
					},
					check(params) {
						this.tallyCheck(params.row.tid,1)
					},
					uncheck(params) {
						this.tallyCheck(params.row.tid,0)
					},
					delete(params) {
						this.delInfo(params.row)
					}
				},
				column_render: {
					int_day (h,params) {
						return h('span',this.$filter('int_date')(params.row.int_day))
					},
					aa_id (h,params) {
						let accounts = this.$store.state.gvars.accounts
						return h('span',accounts.find(a=>a.aa_id===params.row.aa_id).name) 
					},
					to_aa_id (h,params) {
						let accounts = this.$store.state.gvars.accounts,
							obj = accounts.find(a=>a.aa_id===params.row.to_aa_id),
							result = ''
							if(obj){
								result = obj.name
							}
						return h('span',result) 
					},
					relate_id (h,params) {
						let row = params.row,
							result = ''
						if(row.type===1){
							if(row.relate_id>0){
								result = row.order_payment_history.order_receipt_bill.orb_no
							}
						}else{
							if(row.relate_id>0){
								result = row.order_refund_history.order_refund.bill_no
							}
						}
						return h('span',result)
					},
					student_name (h,params) {
						let row = params.row,
							result = ''
						if(row.type===1){
							if(row.relate_id>0){
								if(row.order_payment_history) {
									result = row.order_payment_history.order_receipt_bill.student.student_name
								}else if(row.student){
									result = row.student.student_name
								}
							}
						}else{
							if(row.relate_id>0){
								if(row.order_refund_history) {
									result = row.order_refund_history.order_refund.student.student_name
								}else if(row.student){
									result = row.student.student_name
								}
							}
						}
						return h('span',result)
					},
					sno (h,params) {
						let row = params.row,
							result = ''
						if(row.type===1){
							if(row.relate_id>0){
								result = row.order_payment_history.order_receipt_bill.student.sid
							}
						}else{
							if(row.relate_id>0){
								result = row.order_refund_history.order_refund.student.sid
							}
						}
						return h('span',result)
					},
					tt_id (h,params) {
						let tally_types = this.$store.state.gvars.tally_types,
							obj = tally_types.find(a=>a.tt_id===params.row.tt_id),
							result = ''
							if(obj){
								result = obj.name
							}
						return h('span',result) 
					},
					client_th_id (h,params) {
						let tally_helps = this.$store.state.gvars.tally_helps,
							obj = tally_helps.find(t=>t.type=='client'&&t.th_id==params.row.client_th_id),
							result = ''
						if(obj){
							result = obj.name
						}
						return h('span',result)
					},
					employee_th_id (h,params) {
						let tally_helps = this.$store.state.gvars.tally_helps,
							obj = tally_helps.find(t=>t.type=='employee'&&t.th_id==params.row.employee_th_id),
							result = '-'
						if(obj){
							result = obj.name
						}
						return h('span',result)
					},
					create_eid (h,params) {
						return h('span',this.$filter('ename')(params.row.create_eid))
					},
					item_th_id (h,params) {
						let tally_helps = this.$store.state.gvars.tally_helps,
							obj = tally_helps.find(t=>t.type=='item'&&t.th_id==params.row.item_th_id),
							result = ''
						if(obj){
							result = obj.name
						}
						return h('span',result)
					},
					amount (h,params) {
						let tag = {color: 'red',label:'+ '+params.row.amount}
						if(params.row.type===2){
							tag.color = '#0c6'
							tag.label = '- '+params.row.amount
						}
						return h('span',{
							style: {
								color: tag.color
							}							
						},tag.label)						
					},
					real_amount (h,params) {
						let tag = {color: 'red',label:'+ '+params.row.real_amount}
						if(params.row.type===2){
							tag.color = '#0c6'
							tag.label = '- '
						}
						return h('span',{
							style: {
								color: tag.color
							}							
						},tag.label)						
					},
					tally_file (h,params) {
						if(params.row.tally_file.length>0){
							return h('Button',{
								props: {
									type: 'ghost',
									icon: 'eye',
									size: 'small'
								},
								attrs: {
									title: '查看附件'
								},
								on: {
									click: ()=>{
										this.$Modal.open('components/PreviewFile.vue@modal',{
											props: {
												list: params.row.tally_file
											}
										})
										.then(modal => {
											modal.show('查看附件')
										})
									}
								}
							})
						}else{
							return h('span','-')
						}
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
		created () {
			if(!this.enable_tally_check) {
				delete this.column_keys['is_check']
			}
			if(!this.enable_project){
				delete this.column_keys['pj_id']
			}
		},
		mounted () {
			this.params.search_field = 'relate_id'
			this.init()
		},
		methods: {
			tallyCheck(id,type) {
				let [tip,msg] = type?['通过','审核成功']:['撤销','撤销成功']
				this.confirm('确定'+tip+'审核这条流水记录吗？')
				.then(() => {
					this.$rest('tallys').add_url_param(id,'docheck')
					.post({
						is_check: type
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
			delInfo (row) {
				let tip = '确定删除这条流水记录吗？'
				this.confirm(tip).then(()=>{
					this.delete(row)
				})
			},
			addInfo () {
				this.$r('info').show('新增记账','add')
			},
			editInfo (row) {
				let obj = util.copy(row),
					is_income = true
				obj.cate = obj.cate.toString()
				obj.int_day = this.$filter('int_date')(obj.int_day)
				obj.amount = Number(obj.amount)
				Vue.delete(obj,'_index')
				Vue.delete(obj,'_rowKey')
				Vue.delete(obj,'create_time')
				
				if(obj.cate=='5'){
					obj.cate = '4'					
					is_income = false
				}
				
				this.$r('info')
				.set('info',obj)
				.set('is_income',is_income)
				.show('编辑流水','edit')
			},
			delInfo (row) {				
				this.confirm('确认删除本次记录吗？')
				.then(()=>{
					this.delete(row)
				})
			},
			deal_data (rs) {
				this.amount.income = rs.income_amount
				this.amount.payout_amount = rs.payout_amount
				this.amount.diff = parseFloat(rs.income_amount - rs.payout_amount).toFixed(2)
				return rs.list
			},
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			hook_get_param (params) {
				params = params || {}
				let search_obj = util.copy(this.search_field)		
				params.with = 'student,tally_file'
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'||o=='create_time'){
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
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()				
				this.init_data()
			},
			init() {
				let params = this.$route.params
				if(params&&params.aa_id) {
					this.search_field.aa_id = params.aa_id
				}
				this.init_data()
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			},
			accounts () {
				return this.$store.state.gvars.accounts.filter(a=>a.bids.indexOf(this.bid$)>-1||a.is_public===1)
			},
			employee_help () {
				return this.$store.state.gvars.tally_helps.filter(t => t.type=='employee')
			}
		}
	}
	
</script>
