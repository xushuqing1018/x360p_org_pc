<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="业绩人" prop="eid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.eid" clearable></select-employee>
				</Form-item>
				<Form-item label="签单日期" prop="receipt_time" class="col-md-3 col-sm-6">
					<date-range-picker
							v-model="search_field.receipt_time"
							@on-change="search"
							placement="bottom"
							style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="签单类型" prop="consume_type" class="col-md-3 col-sm-6">
					<Select v-model="search_field.consume_type" clearable>
						<Option :value="-1">不限</Option>
						<Option v-for="item in consume_type_list" :value="item.value">{{item.label}}</Option>
					</Select>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="销售角色" prop="sale_role_did" class="col-md-3 col-sm-6">
						<Select v-model="search_field.sale_role_did" clearable>
							<Option v-for="item in dicts('sale_role')" :value="item.did">{{item.title}}</Option>
						</Select>
					</Form-item>
					<Form-item label="市场渠道" prop="channel" class="col-md-3 col-sm-6">
						<select-channel v-model="search_field.channel" :showAdd="false" clearable></select-channel>
					</Form-item>
					<Form-item label="招生来源" prop="from" class="col-md-3 col-sm-6">
						<Select v-model="search_field.from" clearable>
							<Option v-for="item in dicts('from')" :value="item.did">{{item.title}}</Option>
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
                	<export-button res="employee_receipts" :params="params"></export-button>
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
			        v-loading="'employee_receipts'" 
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
                    <Alert style="margin-top: 10px;" v-if="data.length > 0">
						<span class="ml-3">金额总计：
		        			<Tag color="blue">{{total_receipt}}</Tag>
		        		</span>
		        	</Alert>
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
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectChannel from 'c%/SelectChannel.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [common,globals,grid],
		components: {
			SelectStudent,
			SelectEmployee,
			SelectChannel,
			DateRangePicker,
			ExportButton
		},
		data () {
			return {
				rest_api: 'employee_receipts',
				pk: 'erc_id',
				search_field: {
					sid: 0,
					eid: 0,
					consume_type: -1,
					receipt_time: [],
					channel: '',
					from: 0
                },
                total_receipt: 0,
				column_keys: {
					bid:{
						title:'校区',
						show:true,
						sortable:true
					},
					pj_id:{
						title:'项目',
						show: false
					},
					eid:{
						title:'业绩人',
						show:true,
						sortable:true
					},
					amount:{
						title:'金额',
						show:true,
						sortable:'custom'
					},
					lesson_hour:{
						title: '课时数',
						show: false,
						sortable:'custom'
					},
					consume_type: {
						title: '签单类型',
						show: true
					},
					sale_role_did:{
						title:'销售角色',
						show:true
					},
					student_name: {
						title:'学员姓名',
						show:true
					},
					items:{
						title:'项目',
						width: 250,
						show:true
					},
					order_remark:{
						title:'订单备注',
						width:100,
						show:false
					},
					channel: {
						title: '市场渠道',
						show: true
					},
					from_did: {
						title: '招生来源',
						show: true
					},
					receipt_time: {
						title: '签单日期',
						show: true,
						sortable:'custom'
					},
					create_time: {
						title:'录入日期',
						show:true,
						sortable:'custom'
					}
				},
				column_render:{
					student_name(h,params) {
						if(params.row.student) {
							return h('span',params.row.student.student_name) 
						}else if(params.row.consume_type==4&&params.row.material_sale) {
							return h('span','对外销售：'+params.row.material_sale.name+params.row.material_sale.mobile)
						}else{
							return h('span','-')
						}
					},
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					amount(h,params) {
						let amount = Number(params.row.amount)
						return h('span',{
							style: {
								color: amount>=0?'red':'#0c6'
							}
						},params.row.amount)
					},
					consume_type(h,params) {
						return h('span',this.$filter('consume_type')(params.row.consume_type))
					},
					receipt_time(h,params) {
						return h('span',moment(params.row.receipt_time).format('YYYY-MM-DD'))
					},
					sale_role_did(h,params) {
						return h('span',this.$filter('dict_title')(params.row.sale_role_did,'sale_role'))
					},
					items(h,params) {
						let result = [],
							items = []
						if(params.row.order_receipt_bill) {
							items = params.row.order_receipt_bill.order_receipt_bill_item
						}else if(params.row.order_refund) {
							items = params.row.order_refund.order_refund_item
						}
						if(items.length>0){
							items.forEach(b=>{
								if(b.order_item) {
									if(b.order_item.gtype == 0||b.order_item.gtype == 1) {
										let child = []
										child.push(b.order_item.item_name)
										if(b.order_item.present_lesson_hours > 0){
											child.push(
												h('span',{class:'text-info pull-right'},'(+'+b.order_item.present_lesson_hours+')')
												)
										}
										let nums = h('span',{
											class: 'pull-right'
										},' x '+util.float(b.order_item.nums))
										child.push(nums)
										result.push(h('p',child))
									}else if(b.order_item.gtype == 2){
										let prefix = '储值:'
										if(b.order_item.dc_id > 0){
											prefix='购买储值卡:'
										}
										result.push(h('p',prefix+b.order_item.subtotal+'元'))
									}else{
										result.push(h('p',b.order_item.item_name))
									}
								}
							})
						}
						if(params.row.consume_type==4&&params.row.material_sale) {
							result.push(h('p',[
								h('span',params.row.material_sale.material.name),
								h('span',{
									class: 'pull-right'
								},' x '+util.float(params.row.material_sale.nums))
								]))
						}
						return h('div',result)
					},
					pay_type(h,params) {
						let accounts = this.$store.state.gvars.accounts,
							items = params.row.order_payment_history,
							result = []
						if(items.length>0){
							items.forEach(i=>{
								result.push(h('p',accounts.find(a=>a.aa_id==i.aa_id).name+':'+i.amount))
							})
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
					from_did(h,params) {
						return h('span',params.row.student?this.labelDicts(params.row.student.from_did,'from'):'')
					}
				},
				operation_keys:{
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'receipt.edit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'receipt.delete'
					}
				},
				operation_func: {
					edit(params) {
						this.edit(params.row)
					},
					delete(params) {
						this.del(params.row)
					}
				}
			}
		},
		created() {
			if(!this.enable_er_lesson_hour) {
				delete this.column_keys['lesson_hour']
			}
			if(!this.enable_project){
				delete this.column_keys['pj_id']
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
            init_data(){
                this.loading = true
                this.$rest(this.rest_api)
                .get(this.hook_get_param())
                .success(response=>{
                    this.total_receipt = response.total_receipt
                    this.data = response.list
                    if(typeof response['total'] != 'undefined'){
                        this.total = response.total
                    }
                    if(typeof response['pagesize'] != 'undefined'){
                        this.pageSize = parseInt(response.pagesize)
                    }

                    this.loading = false
                })
                .error(response=>{
                    this.loading = false
                    this.$Message.error(response.body.message||'数据加载失败~')
                })
            },
			edit(row) {
				this.$Modal.open('business/iae/edit-employee-receipt-modal.vue',{
					props: {
						data: row
					},
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('编辑','edit')
				})
			},
			del(row) {
				this.confirm('确定删除这条业绩记录吗？')
				.then(() => {
					this.delete(row)
				})
			},
			hook_get_param () {
                let params = {}

				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='receipt_time'){
						if(property!=','&&property.length>0){
							params[o] = property.join(',')
						}
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
                params.with = 'student'
                params.pagesize = this.pageSize
                params.page = this.pageIndex

                return params
			},
			resetSearch () {
				this.$form('ref_search').reset()
			}
		}
	}
</script>
