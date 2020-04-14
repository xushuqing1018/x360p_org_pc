<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="活动名称" prop="event_id" class="col-md-3 col-sm-6">
					<select-event v-model="search_field.event_id"></select-event>
				</Form-item>
				<Form-item label="签到时间" prop="attend_time" class="col-md-3 col-sm-6">
					<date-range-picker v-model="search_field.attend_time" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
				</Form-item>
				<Form-item label="报名人员" prop="name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.name" placeholder="请输入..."></Input>
				</Form-item>
				<Form-item label="联系电话" prop="tel" class="col-md-3 col-sm-6">
					<Input v-model="search_field.tel" placeholder="请输入..."></Input>
				</Form-item>						
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">               	
                	
                    <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
   
                	<export-button res="events" :params="params"></export-button>				
                	
                	<!-- <CheckboxGroup v-model="search_field.is_transfer" style="display: inline-block;" class="ml-3">
                		<Checkbox class="mb-0" :label="1">已转化</Checkbox>
                		<Checkbox class="mb-0" :label="0">未转化</Checkbox>
                	</CheckboxGroup> -->
                	<span class="ml-2 mr-3">|</span>
                	<CheckboxGroup v-model="search_field.is_attend" style="display: inline-block;">
                		<Checkbox class="mb-0" :label="1">已签到</Checkbox>
                		<Checkbox class="mb-0" :label="0">未签到</Checkbox>
                	</CheckboxGroup>
                    <Button type="primary" icon="qr-scanner" @click="qrCodeAttend">扫码签到</Button>  
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
		            	ref="tableExcel"
		            	v-loading="'event_sign_ups'" 
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
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	import SelectEvent from 'c%/SelectEvent.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
    import dateRangePicker from 'c%/DateRangePicker.vue'
    import moment from 'moment'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			ExportButton,
			SelectEvent,
			SelectStudent,
			dateRangePicker
		},
		data () {
			return {
				rest_api: 'event_sign_ups',
				pk: 'esu_id',
				search_field: {
					event_id: 0,
					name: '',
					tel: '',
					is_attend: [0,1],
					is_transfer: [0,1],
					attend_time: []
				},
				column_keys: {
					event_id: {
						title: '活动名称',
						show: true
                    },
                    event_type_did: {
						title: '活动类型',
						show: true
					},
					name: {
						title: '报名人员',
						show: true
					},
					tel: {
						title: '联系电话',
						show: true
					},
					is_attend: {
						title: '是否签到',
						show: true
					},
					attend_time: {
						title: '签到时间',
						show: true
					},
					mcl_id: {
						title: '是否转化',
						show: true
					},
					remark: {
						title: '备注',
						show: true
					}
				},
				column_render: {
					event_id (h,params) {
						return h('span',params.row.one_event.event_name)
                    },
                    event_type_did (h,params) {
						return h('span',this.labelDicts(params.row.one_event.event_type_did,'event_type'))
					},
					name (h,params) {
						let result = params.row.name,
							tag = {
								color: 'yellow',
								label: '其他人员'
							}
							
						if(params.row.mcl_id > 0){
							tag.color = '#EF6AFF'
							tag.label = '市场名单'
						}
						if(params.row.sid > 0 && params.row.student){
							result = params.row.student.student_name
							tag.color = 'blue'
							tag.label = '在读学员'
						}
						
						return h('div',[
							h('Tag',{
								props: {
									color: tag.color
								}
							},tag.label),
							h('span',result)
						])
					},
					tel (h,params) {
						let tel = params.row.tel
						
						if(params.row.sid > 0 && params.row.student) {
							tel = params.row.student.first_tel
						}
						
						return h('span',tel)
					},
					is_attend (h,params) {
						if(params.row.is_attend==0){
                            let ret = ''

                            let event_start_time = new moment(params.row.one_event.event_start_time).add(params.row.one_event.attend_before_minute * -1, 'm').format('YYYY-MM-DD HH:mm:ss')
                            let event_end_time = params.row.one_event.event_end_time

                            if(params.row.one_event.unattend_before_minute > 0){
                                event_end_time = new moment(params.row.one_event.event_start_time).add(params.row.one_event.unattend_before_minute * 1, 'm').format('YYYY-MM-DD HH:mm:ss')
                            }

                            let now_time = new moment().format('YYYY-MM-DD HH:mm:ss')

                            if(moment(event_start_time).isBefore(now_time) && moment(now_time).isBefore(event_end_time)){
                                ret = h('Button',{
									props:{
										size: 'small',
										icon: 'ios-compose-outline'
									},
									on: {
										'click':()=>{
											this.attend(params.row)
										}
									}
								},'签到')
                            }
							return h('div',[
								h('span',{'class':'mr-3'},'未签到'),
								ret
							])
						}else{
							return h('span',{
								'class':'text-success'
							},'已签到')
						}
					},
					attend_time (h,params) {
						let result = params.row.attend_time
						
						if(result == '1970-01-01 08:00:00'){
							result = '-'
						}
						
						return h('span',result)
					},
					mcl_id (h,params) {
						let result = h('span',{
										'class':'text-success'
									},'已转化')	
						if(params.row.mcl_id==0){							
							if(params.row.sid>0){
								result = h('span','-')
							}else{
								result =
									h('div',[
										h('span',{'class':'mr-3'},'未转化'),
										h('Button',{
											attrs:{
												title: '转化为市场名单'
											},
											props:{
												size: 'small',
												icon: 'arrow-swap'
											},
											on: {
												'click':()=>{
													this.toMarket(params.row)
												}
											}
										},'转化')
									])
									
							}
						}
						return result
					},
					remark (h,params) {
						return h('span',params.row.remark||'-')
					}
				},
				operation_keys:{
//					toMarket: {
//						title: '转为市场名单',
//						type: 'arrow-swap',
//						condition: 'row.sid==0&&row.mcl_id==0'
//					},
					remark: {
						title: '填写备注',
						type: 'edit'
					}
				},
				operation_func: {
//					toMarket (params) {
//						this.toMarket(params.row)
//					},
					remark (params) {
						this.remark(params.row)
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
            qrCodeAttend(){
                this.$Modal.open('app/event/qr-code-attend-modal.vue',{
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				}).then(modal=>{
					modal
					.show('扫码签到','show')
				})
            },
			toMarket (row) {
				let uri = util.sprintf('event_sign_ups/%s/market_clue',row.esu_id)
				this.$rest(uri).post()
				.success(data=>{
					this.$Message.success('转化成功！')
					this.init_data()
				}).error(response=>{
					this.error(response.body.message||'转化失败~')
				})				
			},
			attend (row) {			
				let info = util.copy(row)
				
				info.is_attend = 1
				
				this.$rest('event_sign_ups')
				.add_url_param(info.esu_id)
				.put(info)
				.success(data=>{
					this.$Message.success('签到成功！')
					this.init_data()
				}).error(response=>{
					this.$Message.error(response.body.message||'签到失败~')
				})
			},
			remark (row) {
				this.$Modal.open('app/event/signup-remark-modal.vue',{
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				}).then(modal=>{
					modal
					.set('info',row)
					.show('修改备注','edit')
				})
			},
			resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='attend_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='is_attend'){
                    	if(property.length==1){
	                        params[o] = property[0]  
	                    }
                    }else if(o=='is_transfer'){
                    	if(property.length==1){
                    		if(property[0]==0){
                    			params['mcl_id'] = '0'
                    			params['sid'] = '0'
                    		}else{
                    			params['mcl_id'] = '[>,0]'
                    		}
                    	}
                    }else{
                    	if(property){
	                        params[o] = property    
	                    }   
                    }
                                                     
                }
				params.with = 'student,one_event'
			}
		}
	}
</script>

<style>
</style>