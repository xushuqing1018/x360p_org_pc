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
							<Form-item label="有效性：" class="col-sm-3 mb-0">
								{{item.is_connect==1?'有效:':'无效:'}}
							</Form-item>								
							<Form-item label="下次跟进日期:" class="col-sm-6 mb-0">
								<template v-if="item.next_follow_time==0">待定</template>
								<template v-else>{{item.next_follow_time}}</template>
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
				rest_api: 'mc_follow_ups',
				pk: 'mcfu_id',	
				data: [],
				search_field: {
					create_time: []
				},
				
			}
		},
		watch: {
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
				params.mcl_id = this.cuId?this.cuId:this.$route.params.id
			}
		}
	}
</script>
