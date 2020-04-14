<style lang="less">
	.over-y-scroll{
		overflow-y: auto;
	}
	.h-500{
		height: 380px;
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
			沟通日期：
			<date-range-picker v-model="search_field.create_time" @on-change="init_data" label="选择日期" placement="bottom"></date-range-picker>			
		</div>
		<div class="list-body">			
			<div class="row over-y-scroll h-500 list-body-wrap" style="position: relative;">
				<Spin v-if="loading" fix>
					<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                	<div>加载中...</div>
				</Spin>
				<table class="modal-table x-modal-table">
					<tr v-for="(item,index) in data" :key="index">
						<td>
							<div class="ivu-table-cell">
								<span class="x-tab">{{index+1}}</span>
							</div>
						</td>
						<td>			
							<Form :label-width="90" class="row">
								<Form-item label="跟进人:" class="col-sm-3 mb-0">
									{{item.eid|employee_name}}
								</Form-item>
								<Form-item label="沟通类型:" class="col-sm-3 mb-0">
									{{labelDicts(item.followup_did,'followup')}}
								</Form-item>	
								<Form-item label="实际到访日:" class="col-sm-3 mb-0">
									{{item.int_day|int_date}}
								</Form-item>
								<Form-item label="沟通附件:" class="col-sm-3 mb-0">
									<Button 
										type="ghost" 
										shape="circle"
										icon="eye"
										size="small"
										title="查看回访附件"
										@click="preview(item)" 
										v-if="item.student_return_visit_attachment.length>0">
									</Button>
									<span v-else>无</span>
								</Form-item>
								<Form-item label="沟通内容:" class="col-sm-12 mb-0">
									<span>{{item.content}}</span>
								</Form-item>
																
							</Form>	
							<img src="../../../../img/wuxiao.png" class="invalid-tag" v-if="item.is_connect==0">
						</td>
					</tr>
					<tr v-if="!data.length">
						<td colspan="7">
							<div class="ivu-table-cell text-center">暂时没有回访记录~</div>
						</td>
					</tr>
				</table>				
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
        <preview-file ref="preview" :list="currentFile.student_return_visit_attachment"></preview-file>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import dataReady from 'c%/DataReady.vue'
	import PreviewFile from 'c%/PreviewFile.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [grid,globals,common,modal],
		props: {
			sid: {
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
		components: {
			dataReady,
			PreviewFile,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'student_return_visits?sid='+this.sid,
				pk: 'srv_id',	
				data: [],
				next_follow_status: 0,
				visit_int_day: '',
				per_record_add: false,				
				currentFile: {},
				search_field: {
					create_time: []
				},				
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {			
			preview (item) {
				this.currentFile = item
				this.$refs.preview.show('回访附件','add')
			},
			handleSuccess () {	
				this.init_data()
				this.$emit('on-success')
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				let time = search_obj.create_time
				if(time.length>0) {
					params.create_time = util.sprintf('[between,%s]',time.join(','))
				}
				params.with = 'student_return_visit_attachment'
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
			},
			cancel () {
				this.visit_int_day = ''
				this.close()
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
