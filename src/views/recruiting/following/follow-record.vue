<style>
	.time {
		width: 110px;
		height: 22px;
		font-size: 15px;
		line-height: 22px;
		padding: 0px 6px;
		text-align: center;
		background-color: #3399FF;
		color: white;
		border-radius: 3px;
		position: relative;
		top: -2px;
	}

	.chat_box {
		width: 470px;
		border-radius: 8px;
		border: 1px solid #60baff;
		margin-top: 5px;
		background-color: #EFF4F8;
		position: relative;
		margin-left: 18px;
		padding-bottom: 15px;
	}

	.chat_box table {
		width: 95%;
		margin: 0 auto;
		border-collapse: separate;
		border-spacing: 12px;
		margin-top: 10px
	}

	.chat_box td:nth-child(odd){
		text-align: right;
		color: #657180;
	}

	.chat_box td:nth-child(even){
		position: relative;
		left: -10px;
		color: #333333
	}

	.chat_content {
		position: relative;
		top: 5px;
		left: 30px;
		color: #333;
		width: 90%;
	}

	.chat_angle {
		width: 12px;
		height: 12px;
		border-left: 1px solid #35a8ff;
		border-bottom: 1px solid #35a8ff;
		background-color: #EFF4F8;
		position: absolute;
		top: 20px;
		left: -7px;
		transform: rotate(45deg);
	}
</style>


<template>
	<div class="customer-follow-record">
		<slot></slot>
		<div class="box-result box">
			<Timeline style="margin-left:30px">
				<TimelineItem v-for="items in follow_data">
					<Icon type="record" slot="dot"></Icon>
					<p class="time">{{items[0].create_time.split(' ')[0]}}</p>
					<p class="content">
						<div class="chat_box" v-for="item in items">
							<table>
								<tr>
									<td>跟进人：</td>
									<td style="color:#3399FF">{{item.eid|ename}}</td>
									<td>有效性：</td>
									<td>{{item.is_connect==1?'有效':'无效'}}</td>
									<td>具体时间：</td>
									<td>{{item.create_time.split(' ')[1]}}</td>
								</tr>
								<tr>
									<td>沟通类型：</td>
									<td>{{labelDicts(item.followup_did,"followup")}}</td>
									<td>下次跟进时间：</td>
									<td>{{item.next_follow_time==0?'待定':nextFollowTime(item.next_follow_time)}}</td>
									<td>是否到访：</td>
									<td>{{item.is_promise==1?"是":"否"}}</td>
								</tr>
								<tr>
									<td>沟通内容：</td>
								</tr>
							</table>
							<div class="chat_content">
								{{item.content}}
							</div>
							<div class="chat_angle"></div>
						</div>
					</p>
				</TimelineItem>
				<TimelineItem>
					<Icon type="x" slot="dot"></Icon>
				</TimelineItem>
				
			</Timeline>
			<div v-if="follow_data.length == 0">暂无沟通记录</div>
			<Page v-else :current="pageIndex" :total="total" @on-change="pagesize" />
        </div>
       <Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false">
			<Form :label-width="120">
				<Form-item label="选择到访日期">
					<DatePicker v-model="visit_int_day" type="date" placeholder="选择日期" style="width: 200px"></DatePicker>
				</Form-item>
			</Form>
			<div slot="footer">
				<Button type="primary" @click="ok" :loading="saving">确定</Button>
				<Button type="ghost" @click="cancel">取消</Button>
			</div>
		</Modal>
    </div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import FollowInfo from './follow-info.vue'

	export default{
		mixins: [grid,globals,common,modal],
		components: {
			FollowInfo
		},
		props: {
			cuId: {
				type:[Number,String],
				default: ()=> {
					return 0
				}
			},
			mode: {
				type: String,
				default: ()=>{
					return 'list'
				}
			}
		},			
		data () {
			return {
				rest_api: '',
				pk: 'cfu_id',	
				data: [],
				follow_data: [],
				next_follow_status: 0,
				visit_int_day: '',
				per_record_add: false,
				active_item: {
					content: '',
					next_follow_time: ''
				},
				params: {
					create_time: []
				},
				id: 0,
				column_keys: {
    				create_time: {
    					title: "日期",
                        show:true
    				},
    				eid: {
    					title: '跟进人',
                        show: true
    				},
    				is_connect: {
    					title: '有效性',
    					show: true
    				},
    				followup_did: {
    					title: '沟通类型',
    					show: true
    				},
    				content: {
    					title: '沟通内容',
    					show: true
    				},
    				next_follow_time: {
    					title: '下次跟进日期',
    					show: true
    				},
    				is_visit: {
    					title: '是否到访',
    					show: true
    				},
    				promise_int_day: {
    					title: '诺到访日',
    					show: false
    				},
    				visit_int_day: {
    					title: '实际到访日',
    					show: false
    				},
    				intention_level: {
    					title: '意向级别',
    					show: false
    				}
    			},
    			column_render: {
    				create_time(h,params) {
    					return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
    				},
    				eid(h,params) {
    					return h('span',this.$filter('ename')(params.row.eid))
    				},
    				is_connect(h,params) {
    					let state_map = {1:{label:'有效',color:'#19be6b'},0:{label:'无效',color:'#ed3f14'}}
    					return h('span',{
    						style: {
    							color: state_map[params.row.is_connect].color
    						}
    					},state_map[params.row.is_connect].label)
    				},
    				followup_did(h,params) {
    					return h('span',this.labelDicts(params.row.followup_did,'followup'))
    				},
    				next_follow_time(h,params) {
    					let time = params.row.next_follow_time,formatDay = ''
    					if(time) {
    						formatDay = time
    					}else{
    						formatDay = '待定'
    					}
    					return h('span',formatDay)
    				},
    				is_visit(h,params) {
    					return h('i-switch',{
    						props: {
    							trueValue: 1,
    							falseValue: 0,
    							readonly: true,
    							value: params.row.is_visit
    						},
    						on: {
    							click: () => {
    								this.visit(params.row)
    							}
    						}
    					},  [
    							h('span',{slot:'open'},'是'),
    							h('span',{slot:'close'},'否')
    					    ]
					    )
    				},
    				promise_int_day(h,params) {
    					return h('span',this.$filter('int_date')(params.row.promise_int_day))
    				},
    				visit_int_day(h,params) {
    					return h('span',this.$filter('int_date')(params.row.visit_int_day))
    				},
    				intention_level (h,params) {
						return h('Rate',{
							props:{
								value: params.row.intention_level,
								disabled: true
							}
						})
					}
    			}
			}
		},
		watch: {
			'next_follow_status': function (val) {
				if(val){
					this.active_item.next_follow_time = ''
				}
			},
			'active_item.next_follow_time': function (val) {
				if(this.isBeforeNow(val)){
					this.active_item.next_follow_time = ''
				}
			},
			'cuId': function (val) {
				this.rest_api = 'customer_follow_up?cu_id=' + val
				this.init_data()
			}
		},
		mounted () {
			this.id = this.cuId?this.cuId:this.$route.params.id
			this.rest_api = 'customer_follow_up?cu_id=' + this.id
			this.init_data()
			// this.checkCustomer(this.cuId)
		},
		methods: {
			nextFollowTime(num) {
				return moment(num).format("YYYY-MM-DD");
			},
			deal_data(data){
				var list = data.list;
				if(list.length == 0) {
					return;
				}
				this.total = list.total;
				var rst = [];
				var c_date = '';
				for(var i in list) {
					if(list[i].create_time.split(' ')[0] != c_date) {
						rst.push([list[i]]);
					}
					else {
						rst[rst.length-1].push(list[i])
					}
					c_date = list[i].create_time.split(' ')[0];
				}
				this.follow_data = rst;
				// console.log(rst)

				return data.list
			},
			//检测是否有权限跟进当前选中客户：为当前客户的责任人或副责任人
			checkCustomer (cu_id) {
				let eid = this.eid$
				if(cu_id>0){
					this.dr().getData('customers/'+cu_id)
					.then(data=>{
						if(data.customer.follow_eid===eid||data.deputy.filter(d=>d.eid===eid).length>0){
							this.per_record_add = true
						}else{
							this.per_record_add = false							
						}
					})	
				}
			},
			handleSuccess () {	
				this.init_data()
				this.$emit('on-success')
			},
			hook_get_param (params) {
//				params.create_time = util.get_date_query(this.params.create_time)
			},
			visit (item) {
				this.active_item.cfu_id = item.cfu_id 
				this.active_item.is_visit = item.is_visit
				if(item.is_visit){
					this.confirm('确认取消到访吗？')
					.then(()=>{
						this.confirm_visit()						
					})
				}else{
					this.show('选择到访日期')
				}
			},
			edit (item) {
				this.$r('ref').edit(item)		
			},
			add () {
				this.$r('ref')
				.set('cu_id',this.cuId)
				.show('添加跟进记录','add')
			},
			ok () {
				if(this.visit_int_day==''){
					this.$Message.error('请选择到访日期')
					return false
				}
				this.confirm_visit()
			},
			cancel () {
				this.visit_int_day = ''
				this.close()
			},
			confirm_visit () {
				let [params,active_item] = [{},this.active_item]
				params.is_visit = active_item.is_visit===1?0:1
				if(params.is_visit==1){
					params.visit_int_day = this.visit_int_day	
				}				
				
				this.$rest('customer_follow_up/'+active_item.cfu_id).put(params)
				.success(data=>{
					this.$Message.success('操作成功')
					this.init_data()
					this.cancel()
				}).error(response=>{
					this.error(response.body.message||'操作失败')
				})
			},
			isBeforeNow (val) {
				if(val!=0&&moment(val).add(1,'days').isBefore(moment(new Date()))){
					this.$Message.error('预约时间不能小于当前时间')
					return true
				}
				return false
			},
			addFollowRecord() {
				this.$r('follow_info_ref').checkCustomer(this.id)
				.then(() => {
					this.showAddForm = !this.showAddForm
				})
			}
		}
	}
</script>
