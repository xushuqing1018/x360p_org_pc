<style lang="less">
	.over-y-scroll{
		overflow-y: auto;
	}
	.h-500{
		height: 500px;
	}
	.x-modal-table{
		border: none !important;
		tr td{
			position: relative;
			border-right: none !important;
			.row{
				margin: 0!important;			
			}
		}
	}
	.invalid-tag{
	    position: absolute;
	    right: 60px;
	    top: 30px;
	    width: 80px;
	    transform: rotate(-35deg);
	}
</style>

<template>
	<div>
		<div class="list-condition mb-3">			
			沟通日期： <date-range-picker v-model="search_field.create_time" @on-change="init_data" label="选择日期" placement="bottom"></date-range-picker>
			
			<!--<template v-if="mode=='edit'">
				<Button class="ml-3" type="primary" icon="plus" @click="add" v-if="per_record_add">添加</Button>				
			</template>-->
		</div>
		<div class="list-body">			
			<div class="row over-y-scroll h-500 list-body-wrap" style="position: relative;">
				<Spin v-if="loading" fix>
					<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                	<div>加载中...</div>
				</Spin>
				<Timeline class="p-3">
			        <TimelineItem v-for="(item,index) in data">
			            <p class="time">{{item.create_time.substring(0,16)}}</p>
			            <Form :label-width="90" class="row">
							<Form-item label="跟进人:" class="col-sm-3 mb-0">
								{{item.eid|employee_name}}
							</Form-item>
							<Form-item :label="item.is_connect==1?'沟通类型:':'无效类型:'" class="col-sm-3 mb-0">
								{{item.is_connect==1?labelDicts(item.followup_did,'followup'):labelDicts(item.invalid_followup_did,'invalid_followup')}}
							</Form-item>								
							<Form-item label="下次跟进日期:" class="col-sm-6 mb-0">
								<template v-if="item.next_follow_time==0">待定</template>
								<template v-else>{{item.next_follow_time}}</template>
							</Form-item>
							<Form-item label="是否到访:" class="col-sm-3 mb-0">									
								<i-switch :true-value="1" :false-value="0" :readonly="true" :value="item.is_visit" @click="visit($event,item)" >
									<span slot="open">是</span>
									<span slot="close">否</span>
								</i-switch>
							</Form-item>									
							<Form-item label="诺到访日:" class="col-sm-3 mb-0">
								{{item.promise_int_day|int_date}}
							</Form-item>
							<Form-item label="实际到访日:" class="col-sm-6 mb-0" v-if="item.is_visit">
								{{item.visit_int_day|int_date}}
							</Form-item>							
							<Form-item label="沟通内容:" class="col-sm-8 mb-0">
								<span v-if="!item.$edit">{{item.content}}</span>
							</Form-item>
						</Form>	
						<img src="../../../img/wuxiao.png" class="invalid-tag" v-if="item.is_connect==0">
			        </TimelineItem>
		        </Timeline>
		        <div v-if="!data.length" class="ivu-table-cell text-center">暂时没有沟通记录~</div>				
			</div>
		    <div class="list-page clearfix mt-3">
	            <Page 
	            	class="pull-right" 
	            	size="small" 
	            	:total="total" 
	            	:show-total="true" 
	            	:current="pageIndex" 
	            	:show-sizer="true" 
	            	:page-size="pageSize" 
	            	@on-change="pagenation" 
	            	@on-page-size-change="pagesize">
	            </Page>
	       </div>	        
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
	import util,{_}  from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import dataReady from 'c%/DataReady.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default{
		mixins: [grid,globals,common,modal],
		props: {
			cuId: {
				type:[Number,String],
				default: ()=> {
					return 0
				}
			},
			isPublic: {
				type: [String,Number],
				default: 1
			}
		},			
		components: {
			dataReady,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'customer_follow_up',
				pk: 'cfu_id',	
				data: [],
				next_follow_status: 0,
				visit_int_day: '',
				per_record_add: false,
				active_item: {
					content: '',
					next_follow_time: ''
				},
				search_field: {
					create_time: []
				},
				
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
			cuId: function (val) {
				this.init_data()
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			handleSuccess () {	
				this.init_data()
				this.$emit('on-success')
			},
			hook_get_param (params) {
				let create_time = this.search_field.create_time||[]				
				if(create_time.length>0){
					params.create_time = util.get_date_query(create_time)					
				}
				params.cu_id = this.cuId?this.cuId:this.$route.params.id
			},
			visit (val,item) {				
				if(this.isPublic){
					return
				}
				
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
			}
		}
	}
</script>
