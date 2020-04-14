<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="员工姓名" prop="eid" class="col-sm-6 col-md-3">
					<select-employee v-model="search_field.eid" clearable></select-employee>
				</Form-item>
				<Form-item label="学员姓名" prop="sid" class="col-sm-6 col-md-3">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="意向客户" prop="cu_id" class="col-sm-6 col-md-3">
					<select-customer v-model="search_field.cu_id" clearable></select-customer>
				</Form-item>
				<Form-item label="市场名单" prop="mcl_id" class="col-sm-6 col-md-3">
					<select-market v-model="search_field.mcl_id" clearable></select-market>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="呼叫时间" prop="caller_calltime" class="col-sm-6 col-md-3">
						<date-range-picker 
	    					v-model="search_field.caller_calltime" 
	    					@on-change="search"
	    					style="width:100%">
	    				</date-range-picker>
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
                	<export-button res="webcall_call_logs" :params="params"></export-button>
                	<div class="pull-right">
                        <per-scope per="webcall.manage" @on-change="type_calllog = $event"></per-scope>
                   	</div>
                   	<CheckboxGroup v-model="search_field.is_valid" class="ml-2" style="display: inline-block;">
                   		<Checkbox :label="1" :readonly="readOnly(1,'is_valid')">有效通话</Checkbox>
                   		<Checkbox :label="0" :readonly="readOnly(0,'is_valid')">无效通话</Checkbox>
                   	</CheckboxGroup>
                   	<Button type="ghost" icon="gear-b" class="ml-2" @click="setConfigNumber">主叫号码段</Button>
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Progress 
					:percent="volume_percent" 
					:status="volume_status"
					:stroke-width="12"
					class="volume-percent"
					v-per="'webcall.manage'"
					>
					{{volume_limit - volume_used}} / {{volume_limit}}分钟
				</Progress>
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
				<div class="content-body">
			        <Table 
			        v-loading="'webcall_call_logs'" 
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
	import Vue from 'vue'
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectMarket from 'c%/SelectMarket.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import PlayVoice from "c%/playVoice"
	import ExportButton from 'c%/ExportButton.vue'

	Vue.component('play-voice',PlayVoice)

	export default{
		mixins: [grid,common,globals],
		components: {
			SelectStudent,
			SelectCustomer,
			SelectMarket,
			SelectEmployee,
			DateRangePicker,
			PlayVoice,
			ExportButton
		},
		data () {
			return {
				rest_api: 'webcall_call_logs',
				pk: 'wcl_id',
				active_index: -1,
				volume_limit: 0,
				volume_used: 0,
				search_field: {
					eid: 0,
					sid: 0,
					cu_id: 0,
					mcl_id: 0,
					caller_calltime: [],
					is_valid: [0,1]
				},
				type_calllog: '',
				column_keys: {
					caller_phone: {
						title: '主叫电话'
					},
					callee_phone: {
						title: '被叫电话'
					},
					abillsec: {
						title: '呼叫时长',
						show:true
					},
					billsec: {
						title: '接通时长',
						show:true
					},
					cacu_minutes: {
						title: '计费分钟数'
					},
					caller_calltime: {
						title: '呼叫时间'
					},
					callee_talkbegtime: {
						title: '被叫接听时间'
					},
					callee_talkendtime: {
						title: '被叫结束时间'
					},
					file_url: {
						title: '录音',
						align: 'center',
						show:true
					}
				},
				operation_keys: {
					download: {
						title: '下载录音',
						type: 'ios-download',
						condition: "row.file_url!==''"
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'webcall.manage'
					}
				},
				operation_func: {
					delete(params) {
						this.confirm('确定删除这条通话记录吗？')
						.then(() => {
							this.delete(params.row)	
						})
					},
					download(params) {
						var form = document.createElement('form')
					    form.style.display = 'none'
					    form.target = '_blank'
					    form.method = 'get'
					    form.action = params.row.file_url
					    document.body.appendChild(form)
					    form.submit()
					}
				},
				column_render: {
					caller_phone(h,params) {
						let ename = this.$filter('ename')(params.row.eid)
						return h('div',[
							ename,
							h('p',params.row.caller_phone.replace(/\+86/,''))
							])
					},
					callee_phone(h,params) {
						let name = '',
							id = 0,
							tagMap = {1:['blue','正式学员'],2:['green','意向客户'],3:['yellow','市场名单']}
						if(params.row.sid > 0) {
							name = params.row.student.student_name
							id = 1
						}else if(params.row.cu_id > 0) {
							name = params.row.customer.name
							id = 2
						}else if(params.row.mcl_id > 0) {
							name = params.row.market_clue.name
							id = 3
						}
						return h('span',[
							h('Tag',{
								props: {
									color: tagMap[id][0]
								}
							},tagMap[id][1]),

							name,

							h('div',params.row.callee_phone.replace(/\+86/,''))
							])
					},
					caller_calltime(h,params) {
						return h('span',params.row.caller_calltime?params.row.caller_calltime:'-')
					},
					callee_talkbegtime(h,params) {
						return h('span',params.row.callee_talkbegtime?params.row.callee_talkbegtime:'-')
					},
					callee_talkendtime(h,params) {
						return h('span',params.row.callee_talkendtime?params.row.callee_talkendtime:'-')
					},
					abillsec(h,params) {
						return h('span',this.$filter('duration')(params.row.abillsec))
					},
					billsec(h,params) {
						return h('span',this.$filter('duration')(params.row.billsec))
					},
					cacu_minutes(h,params) {
						return h('span',params.row.cacu_minutes+'分钟')
					},
					file_url(h,params) {
						if(params.row.file_url) {
							return h('play-voice',{
								props: {
									active: this.active_index==params.row._index,
									src: params.row.file_url
								},
								on: {
									click:() => {
										this.active_index = params.row._index
									}
								},
								style: {
									marginTop: '6px',
									marginBottom: '6px'
								}
							})						
						}else{
							return h('span','-')
						}
						
					}
				}
			}
		},
		watch: {
			'type_calllog': function (val) {
				this.init_data()
			}
		},
		computed: {
            volume_percent() {
            	let limit = this.volume_limit
            	let used = this.volume_used
            	if(limit == 0) {
            		return 0
            	}
            	return Math.round((limit - used) / limit * 100)
            },
            volume_status() {
            	if(this.volume_percent == 0) {
            		return 'normal'
            	}else if(this.volume_percent == 100) {
            		return 'success'
            	}else if(this.volume_percent > 0 && this.volume_percent < 10) {
            		return 'wrong'
            	}else{
            		return 'active'
            	}
            }
		},
		methods: {
			setConfigNumber() {
				this.$Modal.open('app/webcall/config-modal.vue',{
					on: {
						'save':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('设置主叫号码段')
				})
			},
			deal_data(data){
				for(let i=0,len=data.list.length;i<len;i++) {
					data.list[i]._index = i
				}
				this.volume_used = data.volume_used
				this.volume_limit = data.volume_limit
				return data.list
			},
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			hook_get_param(params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='caller_calltime'){
                        if(property!=','&&property.length>0){
                            params[o] = util.sprintf('[Between,%s]',property.join(','))
                        }                                               
                    }else if(o=='is_valid'){
                    	if(property.length == 1){
	                        if(property[0] == 1) {
	                            params['billsec'] = '[>,0]'
	                        }else if(property[0] == 0) {
	                            params['billsec'] = 0
	                        }
						}
                    }else{
                        if(property&&property!=-1){
                            params[o] = property    
                        }       
                    }                                   
                }
				params.with = 'student,customer,market_clue'
				if(this.type_calllog == 'my') {
					params.eid = this.eid$
				}
			},
			resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
            }
		}
	}
</script>
<style lang="less">
	.volume-percent {
		width: 40%;
		line-height: 24px;
		.ivu-progress-outer {
			width: 70%;
		}
	}
</style>
