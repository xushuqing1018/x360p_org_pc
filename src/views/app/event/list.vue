<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="活动名称" prop="event_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.event_name" placeholder="请输入..."></Input>
				</Form-item>
				<Form-item label="开始时间" prop="event_start_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.event_start_time" 
						@on-change="search" 
						label="开始时间" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="结束时间" prop="event_end_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.event_end_time" 
						@on-change="search" 
						label="开始时间" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="活动类型" prop="event_type_did" class="col-md-3 col-sm-6">
					<Select v-model="search_field.event_type_did" @on-change="switchClassSearch">
						<Option :value="0">不限</Option>
						<Option :value="item.did" v-for="item in dicts('event_type')">{{item.title}}</Option>
					</Select>
				</Form-item>				
				<Form-item label="选择班级" prop="cid" class="col-md-3 col-sm-6" v-if="showClassSearch">
					<select-class v-model="search_field.cid" clearable></select-class>
				</Form-item>				
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <!--<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>-->
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
   
                	<export-button res="events" :params="params"></export-button>
					
                	<CheckboxGroup class="ml-3" v-model="search_field.status" style="display: inline-block;">
                		<Checkbox class="mb-0" :label="0">已禁用</Checkbox>
                		<Checkbox class="mb-0" :label="1">正常</Checkbox>
                		<Checkbox class="mb-0" :label="2">已结束</Checkbox>
                		<Checkbox class="mb-0" :label="3">已取消</Checkbox>
                	</CheckboxGroup>                		
                </Col>
           </Row>	
		</div>		
		<div class="box box-result">
			<div class="toolbar">
				<Button class="ml-2" type="primary" icon="plus" @click="addInfo" v-per="'event.add'">添加</Button>
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	ref="tableExcel"
		            	v-loading="'events'" 
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
    import moment from 'moment'
	
	import ExportButton from 'c%/ExportButton.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectClass from 'c%/SelectClass.vue'
		
	export default{
		mixins: [ grid, common, globals ],
		components: {
			ExportButton,
			DateRangePicker,
			SelectClass
		},
		data () {
			return {
				rest_api: 'events',
                pk: 'event_id',
                classes:[],	
				search_field: {
					event_name: '',
					event_type_did: 0,
					status: [0,1,2,3],
					event_start_time: [],
					event_end_time: [],
					cid: 0,
				},
				column_keys: {
					event_name: {
						title: '活动名称',
                        show: true,
                        width: 300
					},
					event_type_did: {
						title: '活动类型',
						show: true
					},
					status: {
						title: '活动状态',
						show: true
					},
					view_nums: {
						title: '浏览次数',
						show: true
					},
					apply_progress: {
						title: '报名进度',
						show: true
					},
					scope: {
						title: '活动范围',
						show: true
					},
					
				},
				column_render: {
					event_name (h,params) {
						let start_time = params.row.event_start_time.substring(0,16),
							end_time = params.row.event_end_time.substring(0,16)
						return h('div',{
							'class': 'pt-2 pb-2'
						},
						[
							h('img',{
								attrs:{
									src: params.row.event_image_url
								},
								style:{
									width: '150px',
									height: '75px'
								}
							}),
							h('p',`活动名称: ${params.row.event_name}`),
							h('p',`活动时间: ${start_time} -- ${end_time}`)			
						])
					},
					event_type_did (h,params) {
						return h('span',this.labelDicts(params.row.event_type_did,'event_type'))
					},
					apply_progress (h,params) {
						let row = params.row,
							percent = (row.apply_nums / row.apply_nums_limit) * 100
							
						return h('i-progress',{
							props: {
								percent: percent
							}
						},row.apply_nums + '/' + row.apply_nums_limit)
					},
					status (h,params) {
						let map_status = { 0:'已禁用',1:'正常',2:'已结束',3:'已取消' },
							map_class = { 0:'text-danger',1:'text-success',2:'text-primary' ,3:'text-gray'}
						return h('span',{
							'class': map_class[params.row.status]
						},map_status[params.row.status])
					},
					scope (h,params) {
						let result = '全局'
						
						if(params.row.scope=='class'){							
                            result = '班级活动：'
                            if(params.row.cids.length>0){
								params.row.cids.forEach(id=>{
                                    let c = this.classes.find(x => x.cid == id)
									result += c.class_name + ','
								})
								result = result.substring(0,result.length-1)
							}
                        }
                        else if(params.row.scope=='grade'){
                            result = '年级活动：'
							if(params.row.grades.length>0){
								params.row.grades.forEach(id=>{
									result += this.$filter('dict_title')(id,'grade') + ','
								})
								result = result.substring(0,result.length-1)
							}
                        }
						else if(params.row.scope=='branch'){
							result = '校区活动：'
							if(params.row.bids.length>0){
								params.row.bids.forEach(id=>{
									result += this.$filter('branch_name')(id) + ','
								})
								result = result.substring(0,result.length-1)
							}
						}
						
						return h('span',result)
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
                        per: 'event.edit',
                        condition: '(row.status==0 || row.status==1) && row.eventsignup_count == 0'
                    },
                    summary: {
						title: '活动统计',
                        type: 'ios-paper'
					},
					share: {
						title: '生成二维码',
						type: 'qr-scanner',
						condition: 'row.status==1'
					},
					open: {
						title: '启用',
						type: 'checkmark-circled',
						condition: 'row.status==0'
					},
					disabled: {
						title: '禁用',
						type: 'minus-circled',
						condition: 'row.status==1 && row.eventsignup_count == 0'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
                        per: 'event.delete',
                        condition: '(row.status==0 || row.status==1) && row.eventsignup_count == 0'
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
                    },
                    summary (params) {
						this.summaryInfo(params.row)
					},
					share (params) {
						this.share(params.row)
					},
					open (params) {
						this.openOrDisInfo(params.row,'1')
					},
					disabled (params) {
						this.openOrDisInfo(params.row,'0')
					},
					del (params) {
						this.delInfo(params.row)
					}
				},
				showClassSearch: false
			}
        },	
        created(){
            this.get_classes()
        },
		mounted () {
			this.init_data()
		},
		methods: {
            get_classes(){
                this.$rest('classes/get_all')
                .get()
                .success(res => {
                    this.classes = res.list
                })
            },
			switchClassSearch(item) {
				if(item == 181) {
					this.showClassSearch = true;
				}
				else {
					this.showClassSearch = false;
				}
			},
			share (row) {
				this.$Modal.open('app/event/signup-qr-modal.vue')
				.then(modal=>{
					modal
					.set('event_id',row.event_id)
					.show('活动二维码')
				})
            },
            summaryInfo(row){
                this.$Modal.open('app/event/summary-info-modal.vue',{
                    props:{
                        item: row
                    }
				})
				.then(modal=>{
					modal.show(`【${row.event_name}】统计`,'show')
				})
            },
			editInfo (row) {
                let item = JSON.parse(JSON.stringify(row))
				if(!item.questionnaire_bind){
					item.questionnaire_bind = {
						qid:0,
						bind_table:'event'
					}
                }
                let start_hours = moment(item.event_start_time).get('hours')
                let start_minutes = moment(item.event_start_time).get('minutes')
                item.strat_hour = start_hours + ':' + start_minutes
                item.event_start_time = moment(item.event_start_time).format('YYYY-MM-DD')
                let end_hours = moment(item.event_end_time).get('hours')
                let end_minutes = moment(item.event_end_time).get('minutes')
                item.end_hour = end_hours + ':' + end_minutes
                item.event_end_time = moment(item.event_end_time).format('YYYY-MM-DD')
				this.$Modal.open('app/event/info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('info',item)
					.show('编辑活动','edit')
				})
			},
			openOrDisInfo (row,status) {
				let info = util.copy(row),
					tip = util.sprintf('确定%s活动【%s】吗？',status==1?'启用':'禁用',row.event_name)
				info.status = status
				
				this.confirm(tip).then(()=>{
					this.$rest('events')
					.add_url_param(row.event_id)
					.put(info)
					.success(data=>{
						this.$Message.success('操作成功！')
						this.init_data()
					}).error(response=>{
						this.error(response.body.message||'操作失败~')
					})
				})
				
			},
			delInfo (row) {
				let tip = util.sprintf('确定删除【%s】活动吗？',row.event_name)
				this.confirm(tip).then(()=>{
					this.delete(row)
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
                    if(o=='event_start_time'||o=='event_end_time'){
                        if(property!=','&&property.length>0){
                            params[o] = util.sprintf('[Between,%s]',property.join(','))
                        }                                               
                    }else if (o=='status'){
                        if(property.length>0){
                            params[o] = util.sprintf('[In,%s]',property.join(','))
                        }
                    }
                    else{
                        if(property&&property!=-1){
                            params[o] = property    
                        }       
                    }                                   
                }
				params.with = 'one_class,event_attachment'
			},
			addInfo () {
				this.$Modal.open('app/event/info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加活动','add')
				})
			}
		}
	}
</script>

<style>
</style>