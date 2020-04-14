<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="时间范围" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker 
						:value="search_field.int_day" 
						@on-change="search_field.int_day=$event" 
						label="请选择年月" 
						style="width:100%">
					</date-range-picker>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="resetSearch">刷新统计</Button>	
					<export-button res="report_branch_order_summaries" :params="hook_get_param()"></export-button>
                </Col>
            </Row>
		</div>
		<div class="box box-result">
	        <div class="content">
                <div class="content-body">
                    <table class="modal-table" style="min-height:150px;">
	            		<thead>
	            			<tr>
	            				<th><div class="ivu-table-cell">#</div></th>
								<th><div class="ivu-table-cell">学员编号</div></th>
								<th><div class="ivu-table-cell">学员姓名</div></th>
	            				<th><div class="ivu-table-cell">收据编号</div></th>
								<th><div class="ivu-table-cell">订单编号</div></th>
								<th width="200"><div class="ivu-table-cell">收据资料</div></th>
                                <th><div class="ivu-table-cell">付款日期</div></th>
                                <th><div class="ivu-table-cell">付款方法</div></th>
                                <th><div class="ivu-table-cell">银行名称</div></th>
                                <th><div class="ivu-table-cell">负责职员</div></th>
<!--								fix : 小北京客户不需要 这两列-->
<!--                                <th><div class="ivu-table-cell">发票</div></th>-->
<!--                                <th><div class="ivu-table-cell">备注</div></th>-->
                                <th><div class="ivu-table-cell">课程费用</div></th>
                                <th><div class="ivu-table-cell">货品费用</div></th>
                                <th><div class="ivu-table-cell">其他费用</div></th>
                                <th><div class="ivu-table-cell">金额</div></th>
                                <th><div class="ivu-table-cell">已付金额</div></th>
	            			</tr>
	            		</thead>
	            		<tbody>
							<template v-for="(item,index) in month">
								<tr v-for="(v,i) in data.list[item]" :key="i">
	            					<td><div class="ivu-table-cell">{{computed_index(index,i)}}</div></td>
									<td><div class="ivu-table-cell">{{v.sno}}</div></td>
									<td><div class="ivu-table-cell">{{v.sname}}</div></td>
									<td><div class="ivu-table-cell">{{v.orb_no}}</div></td>
									<td><div class="ivu-table-cell">{{v.order_no}}</div></td>
									<td><div class="ivu-table-cell">{{v.lesson_names}}</div></td>
									<td><div class="ivu-table-cell">{{v.paid_time}}</div></td>
									<td><div class="ivu-table-cell">{{v.order_from}}</div></td>
									<td><div class="ivu-table-cell">{{v.bank}}</div></td>
									<td><div class="ivu-table-cell">{{v.charge}}</div></td>
<!--									<td><div class="ivu-table-cell">{{v.invoice_no}}</div></td>-->
<!--									<td><div class="ivu-table-cell">{{v.remark}}</div></td>-->
									<td><div class="ivu-table-cell">{{v.course_fee}}</div></td>
									<td><div class="ivu-table-cell">{{v.product_fee}}</div></td>
									<td><div class="ivu-table-cell">{{v.other_fee}}</div></td>
									<td><div class="ivu-table-cell">{{v.amount}}</div></td>
									<td><div class="ivu-table-cell">{{v.paid_amount}}</div></td>
	            				</tr>
								<tr style="font-weight: bold;">
	            					<td><div class="ivu-table-cell">{{item}}</div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell"></div></td>
									<td><div class="ivu-table-cell">{{month_summary[item].course_fee}}</div></td>
									<td><div class="ivu-table-cell">{{month_summary[item].product_fee}}</div></td>
									<td><div class="ivu-table-cell">{{month_summary[item].other_fee}}</div></td>
									<td><div class="ivu-table-cell">{{month_summary[item].amount}}</div></td>
									<td><div class="ivu-table-cell">{{month_summary[item].paid_amount}}</div></td>
	            				</tr>
							</template>
	            			<tr v-if="month.length == 0">
	            				<td colspan="17" align="center"><div class="ivu-table-cell">没有数据哦</div></td>
	            			</tr>
	            		</tbody>
	            	</table>
                </div>
                <div class="content-footer">
		        	<Alert>
						<span class="ml-3">退款总计：
		        			<Tag color="red">{{month_total.refund_amount || 0}}</Tag>
		        		</span>
						<span class="ml-3">订单金额总计：
		        			<Tag color="yellow">{{month_total.total_order_amount || 0}}</Tag>
		        		</span>
						<span class="ml-3">已支付金额总计：
		        			<Tag color="yellow">{{month_total.total_paid_amount || 0}}</Tag>
		        		</span>
		        		<span class="ml-3">课程类费用：
		        			<Tag color="blue">{{month_total.course_fee || 0}}</Tag>
		        		</span>
		        		<span class="ml-3">货品类费用：
		        			<Tag color="blue">{{month_total.product_fee || 0}}</Tag>
		        		</span>
		        		<span class="ml-3">其他费用：
		        			<Tag color="blue">{{month_total.other_fee || 0}}</Tag>
		        		</span>
						<span class="ml-3" v-for="payment in month_total.payment_classify">{{payment.name}}：
		        			<Tag color="green">{{payment.aa_amount || 0}}</Tag>
		        		</span>
		        	</Alert>
		        </div>  
            </div>
	    </div>
	</div>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			DateRangePicker,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_branch_order_summaries',
				search_field: {
                    bid:0,
                    paid_time:'',
					int_day: util.recent_month_range(1),
				},
                isRefresh: false,
				month:[],
				month_summary:{},
				month_total:{},
                data:[]
			}
		},
		mounted() {
			this.init_data()
		},
		computed:{
			computed_index() {
                return function(index,i) {
					let no = i + 1

                    if (index != 0) {
						for (let i = index; i > 0; i--) {
							no = this.data.list[this.month[i - 1]].length + no
						}
					}

					return no
                }   
            }
		},
		methods: {
            init_data(){
				if(this.search_field.int_day[0] === '') {
					this.$Message.error('时间段不能为空')
					return
				}

                this.$rest(this.rest_api)
				.get(this.hook_get_param())
				.success(res => {
					this.month = []
                    for(var name in res.list) {
						this.month.push(name)
                    }
					this.data = res
					this.total = res.total
					this.month_summary = res.summary.month
					this.month_total = res.summary.total
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
            },
			hook_get_param () {
                let params = {}

				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params['start_date'] = property[0]
					     	params['end_date']   = property[1]
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				if(this.isRefresh){
					params.refresh = 1
				}
				this.isRefresh = false
				delete params['page']
                delete params['pagesize']
                
                return params
			},
			resetSearch () {
				this.isRefresh = true
				this.init_data()
			}
		}
	}
</script>

