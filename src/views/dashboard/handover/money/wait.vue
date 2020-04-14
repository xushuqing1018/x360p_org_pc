<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :label-width="90" :model="search_field" class="filter-form row">
				<Form-item label="交班人" prop="to_eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid"></select-employee>
    			</Form-item>
    			<Form-item label="交班时间" prop="submit_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.submit_time" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
    			<Form-item label="确认状态" prop="ack_time" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.ack_time">
    					<Option value="1">已确认</Option>
    					<Option value="0">未确认</Option>
    				</Select>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                </Col>
            </Row>
		</div>
		<div class="box box-result">
			<div class="toolbar">	
				<Alert show-icon class="mb-0">请确认交班后再勾选进行交款操作</Alert>
			</div>
    		<div class="content" style="font-size:14px">
    			<div class="content-body">
    				<div class="ivu-table-wrapper">
			            <table class="table-list" v-loading.like="'handover_works'">
			            	<thead>
			            		<tr>
			            			<th>
			            				<div class="ivu-table-cell">
			            					<Checkbox v-model="select_all" :disabled="unconfirm_all" @on-change="toggleSelectAll($event)"></Checkbox>
			            				</div>
			            			</th>
			            			<th><div class="ivu-table-cell">交班人</div></th>
			            			<th><div class="ivu-table-cell">收费金额</div></th>
			            			<th><div class="ivu-table-cell">退费金额</div></th>
			            			<th><div class="ivu-table-cell">收费现金</div></th>
			            			<th><div class="ivu-table-cell">退费现金</div></th>
			            			<th><div class="ivu-table-cell">交班时间</div></th>
			            			<th><div class="ivu-table-cell">确认时间</div></th>
			            			<th><div class="ivu-table-cell">操作</div></th>
			            		</tr>
			            	</thead>
			            	<tbody>
			            		<tr v-for="item in data">
			            			<td>
			            				<div class="ivu-table-cell">
			            					<Checkbox v-model="item.$selected" :disabled="!item.ack_time" @on-change="toggleSelect($event,item)"></Checkbox>
			            				</div>
			            			</td>
			            			<td><div class="ivu-table-cell">{{item.eid|ename}}</div></td>
									<td><div class="ivu-table-cell">
										<a class="x-a-link text-info" @click="showDetail(item)">{{label_currency}}{{item.money_inc_amount}}</a>
									</div></td>
									<td><div class="ivu-table-cell">{{label_currency}}{{item.money_dec_amount}}</div></td>
									<td><div class="ivu-table-cell">{{label_currency}}{{item.cash_inc_amount}}</div></td>
									<td><div class="ivu-table-cell">{{label_currency}}{{item.cash_dec_amount}}</div></td>
									<td><div class="ivu-table-cell">{{item.submit_time}}</div></td>
									<td><div class="ivu-table-cell">{{item.ack_time||'-'}}</div></td>
									<td>
										<div class="ivu-table-cell">
											<Button type="primary" @click="confirmHand(item)" :disabled="!!item.ack_time">确认</Button>
										</div>
									</td>
			            		</tr>
			            		<tr v-if="data.length==0">
			            			<td colspan="9" class="text-center"><span>没有数据</span></td>
			            		</tr>
			            	</tbody>
		            	</table>
            		</div>
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
    	<div class="box text-center">
    		<Button type="primary" size="large" style="width:100px;padding:6px 15px" @click="handoverMoney">交款</Button>
    	</div>
    	<hand-info ref="hand_info" @on-success="handSuccess"></hand-info>
    	<record-work-detail ref="record_detail"></record-work-detail>
	</div>
</template>
<script>
	import moment from 'moment'
	import util   from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid   from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import HandInfo from './hand-info.vue'
	import RecordWorkDetail from '../work/record-work-detail.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins:[common,grid,globals],
		components: {
			HandInfo,
			RecordWorkDetail,
			SelectEmployee,
			DateRangePicker
		},
		data() {
			return {
				rest_api:'',
				select_all:false,
				selIds:[],
				unconfirm_all:false,
				amount_total:0,		// 交款总额(含非现金)
				cash_total:0,		// 交款总现金
				search_field: {
					ack_time: '',
					eid: 0,
					submit_time:[]
				}
			}
		},
		mounted() {
			this.rest_api = 'handover_works?hm_id=0&to_eid='+this.eid$
			this.init_data()
		},
		methods: {
			checkSelectAll(item, index, arr) {
				if(item.ack_time) {
					if(this.selIds.indexOf(item.hw_id) !== -1) {
		        		return true
		        	} else {
		        		return false
		        	}
				}
				return true
	        },
			refreshData(data) {
				data.forEach((item) => {
					if(this.selIds.indexOf(item.hw_id) !== -1) {
						item.$selected = true
					} else {
						item.$selected = false
					}
				})
				if(this.unconfirm_all) {
					this.select_all = false
				}else{
					this.select_all = data.every(this.checkSelectAll)
				}
			},
			deal_data(data){
	            if(data.list.length > 0){
	            	this.unconfirm_all = data.list.filter(item => !item.ack_time).length == data.list.length
	                this.refreshData(data.list)
	            }else{
	            	this.unconfirm_all = false
	            	this.select_all = false
	            }
	            return data.list
	        },
	        toggleSelect(event,item) {
				if(event){
                    this.addSelectedId(item)
                }else{
                    this.removeSelectedId(item)
                }
			},
			addSelectedId(item) {
				if(this.selIds.indexOf(item.hw_id) === -1) {
					this.selIds.push(item.hw_id)
					this.cacuCashAndTotal(item,'push')
					this.refreshData(this.data)
				}
			},
			removeSelectedId(item) {
				let index = this.selIds.indexOf(item.hw_id)
	            if(index !== -1){
	                this.selIds.splice(index,1)
	                this.cacuCashAndTotal(item,'splice')
	                this.refreshData(this.data)
	            }
			},
			toggleSelectAll(event) {
	        	this.data.forEach((item)=>{
	        		if(item.ack_time) {
	        			let index = this.selIds.indexOf(item.hw_id)
		        		if(event) {
		        			if(index == -1) {
			        			this.selIds.push(item.hw_id)
			        			this.cacuCashAndTotal(item,'push')
			        			item.$selected = true
			        		}
		        		} else {
		        			if(index > -1) {
		        				this.selIds.splice(index,1)
		        				this.cacuCashAndTotal(item,'splice')
		        				item.$selected = false
		        			}
		        		}
	        		}
	        	})
	        },
	        cacuCashAndTotal(item,type) {
	        	let income = util.sub(item.money_inc_amount,item.money_dec_amount),
	        		cash = util.sub(item.cash_inc_amount,item.cash_dec_amount)
	        	if(type == 'push') {
	        		this.amount_total = util.add(this.amount_total,income)
	        		this.cash_total = util.add(this.cash_total,cash)
	        	}else if(type == 'splice') {
	        		this.amount_total = util.sub(this.amount_total,income)
	        		this.cash_total = util.sub(this.cash_total,cash)
	        	}
	        },
			confirmHand(item) {
				let ename = this.$filter('ename')(item.eid)
				this.confirm(util.sprintf('确认【%s】的交班吗？',ename)).then(() => {
					this.$rest('handover_works/ack')
					.get({hw_id:item.hw_id})
					.success(res => {
						this.$Message.success('确认交班成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			handoverMoney() {
				if(this.selIds.length==0) {
					this.$Message.error('请至少勾选一项')
					return false
				}
				let param = {
					eid:this.eid$,
					hw_ids:this.selIds
				}
				let info = {
					cash_total: this.cash_total,
					amount_total: this.amount_total,
					non_cash: util.sub(this.amount_total,this.cash_total)
				}
				this.$refs.hand_info
				.set('info',info)
				.set('param',param)
				.show(util.sprintf('交款【%s】',this.$filter('ename')(this.eid$)),'handover')
			},
			showDetail(row) {
				this.$refs.record_detail
				.set('data',row.order_receipt_bill.concat(row.order_refund))
				.show(util.sprintf('交班详情【%s】',this.$filter('ename')(row.eid),'list'))
			},
			handSuccess() {
				this.init_data()
				this.selIds.splice(0,this.selIds.length)
				this.cash_total = 0
				this.amount_total = 0
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='ack_time'||o=='tid'){
						if(property == '1'){
	                        params[o] = '[>,0]'
						}else if(property == '0') {
							params[o] = 0
						}
					}else if(o=='submit_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s,%s]',property[0].replace(/-/g,'')
								,property[1].replace(/-/g,''))
						}												
					}else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}									
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
	}
</script>