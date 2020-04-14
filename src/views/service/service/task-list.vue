<template>
	<div class="c-grid">
		<Button type="primary" icon="plus" @click="addTask">安排</Button>
		<div class="box box-result">
	        <div class="content">
	        	<div class="content-body">
		            <Table 
		            	v-loading="'service_tasks'" 
		            	ref="tableExcel"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
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
		                	@on-page-size-change="pagesize">
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
	import FileItem from 'c%/FileItem.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			FileItem
		},
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			sid: {
				type: [Number,String],
				default: 0
			},
			cid: {
				type: [Number,String],
				default: 0
			},		
			type: {
				type: [Number,String],
				default: 0
			}			
		},
		data () {
			return {
				data: [],
				rest_api: 'service_tasks',
				pk: 'st_id',
				column_keys: {
					st_did: {
						title: '服务类型',
						show: true
					},
					int_day: {
						title: '截止时间',
						show: true
					},
					own_eid: {
						title: '责任人',
						show: true
					},
					remark: {
						title: '备注',
						show: true
					},
					status: {
						title: '状态',
						show: true
					},
					remark: {
						title: '备注',
						show: true
					},
					operate: {
						title: '操作',
						show: true
					}
				},
				column_render: {
					st_did (h,params) {
						let label = ''
						if(params.row.cid > 0){
							label = this.$filter('dict_title')(params.row.st_did,'class_service_type')
						}else{
							label = this.$filter('dict_title')(params.row.st_did,'student_service_type')
						}
						return h('span',label)
					},
					int_day (h,params) {
						let result = util.sprintf('%s %s',this.$filter('int_date')(params.row.int_day),this.$filter('int_hour')(params.row.int_hour))
						let	classes = ''
						if(moment(result).isBefore(moment(new Date()).format('YYYY-MM-DD hh:mm'))){
							classes = 'text-danger'
						}
						return h('span',{
							'class': classes
						},result)
					},
					own_eid (h,params) {
						return h('span',this.$filter('ename')(params.row.own_eid))
					},
					status (h,params) {
						let map = {'0':'待办','1':'完成','-1':'取消'},
							map_class = {'0':'text-info','1':'text-success','-1':'text-danger'}
						return h('span',{
							'class':map_class[String(params.row.status)]
						},map[String(params.row.status)])
					},
					operate (h,params) {
						let result = [],
							btn_complete = h('Button',{
								'class': 'mr-2',
								attrs: {
									title: '完成本次服务安排'
								},
								props: {
									icon: 'checkmark'
								},
								on: {
									click: ()=>{
										this.completeInfo(params.row)
									}
								}
							}),
							btn_del = h('Button',{
								attrs: {
									title: '删除本次服务安排'
								},
								props: {
									icon: 'ios-trash'
								},
								on: {
									click: ()=>{
										this.delInfo(params.row)
									}
								}
							})
							
							
						if(params.row.status=='0'){
							result = [btn_complete,btn_del]
						}else if(params.row.status=='1'){
							result = [btn_del]
						}else{
							result = [btn_del]
						}
						return h('div',result)
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			addTask() {
				this.$Modal.open('service/service/task-modal.vue',{
					props: {
						sid: this.sid,
						cid: this.cid,
						type: this.type
					},
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.show('添加服务安排','add')
				})
			},
			completeInfo (row) {
				this.$Modal.open('service/service/task-modal.vue',{
					props: {
						type: this.type
					},
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',row)
					.show('更新服务安排','edit')
				})
			},
			delInfo (row) {
				let tip = util.sprintf('确定删除本次服务安排吗？')
				this.confirm(tip).then(()=>{
					this.delete(row)
				})
			},
			hook_get_param (params) {
				if(this.sid){
					params.sid = this.sid					
				}
				if(this.cid){
					params.cid = this.cid
				}
				params.with = 'student_return_visit'
			}
		}
	}
</script>

<style lang="less" scoped>
	/*.title{
		font-size: 18px;
	}
	.content{
	    margin-top: 10px;
	    font-size: 14px;
	    position: relative;
	    padding-bottom: 10px;
	    padding: 10px;
	    box-shadow: 0px 0px 3px rgba(0,0,0,.3);
	    border-radius: 2px;
	    &:before{
	    	content: '';
		    position: absolute;
		    top: -8px;
		    left: 10px;
		    width: 15px;
		    height: 15px;
		    background: #fff;
		    border: 1px solid #dddee1;
		    transform: rotate(45deg);
		    z-index: 10;
		    border-right: none;
		    border-bottom: none;
		    border-radius: 3px 0 0 0;
	    }
	}*/
</style>