<template>
	<div class="c-grid">		
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item label="到离校日期" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="search" 
						label="选择日期" 
						style="width:100%"
						placement="bottom">
					</date-range-picker>
				</Form-item>
				
				<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid"></select-student>
				</Form-item>
				<div class="col-md-3 mt-2">
                    <Button class="mr-2" type="primary" @click="search" icon="ios-search">查询</Button>  
                   
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
				</div>
			</Form>
			
			<select-student class="hide" ref="students" v-model="sids" @select="customAttendPost"></select-student>
			
		</div>
		
		<div class="box box-result">
			
			<div class="toolbar">
				<Dropdown>
			        <Button type="primary" icon="arrow-down-b">到离校登记</Button>
			        <DropdownMenu slot="list">
			            <DropdownItem @click.native="customAttend('arrive')">到校登记</DropdownItem>
			            <DropdownItem @click.native	="customAttend('leave')">离校登记</DropdownItem>
			        </DropdownMenu>
			    </Dropdown>
			    <Button type="primary" icon="ios-card" @click="showSwipeModal">到离校刷卡</Button>
			</div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 
		            	v-loading="'student_attend_school_logs'" 
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
	import {_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	export default{
		mixins:[grid,common,globals],
		components: {
			SelectStudent,
			dateRangePicker
		},
		data () {
			return {
				rest_api: 'student_attend_school_logs',
				pk: 'ca_id',
				mapLessonType: {0:'班课',1:'一对一',2:'一对多'},
				search_field: {
					int_day: util.today_range(),
					sid: 0
				},
				attendType: 'arrive',
				sids: [],
				column_keys: {
					sname:{
						title: '学员',
						show: true
					},
					is_attend: {
						title: '到校时间',
						show: true
					},
					is_leave: {
						title: '离校时间'
					}
				},
				column_render: {
					sname (h,params) {
						return h('avatar-and-name',{
							props: {
								name: params.row.student.student_name,
								src: params.row.student.photo_url,
								sex: params.row.student.sex
							}
						})
					},
					is_attend (h,params) {
						return h('span',params.row.attend_time||'-')
					},
					is_leave (h,params) {			
						let today = moment(new Date()).format('YYYYMMDD'),
							result = h('span',params.row.leave_time||'-')
						if(params.row.is_leave==0&&params.row.int_day==today){
							result = h('Button',{
								props:{
									type: 'primary',
									icon: 'card'			
								},
								on: {
									click: ()=>{
										this.customAttendPost([params.row.sid],true)
									}
								}
							},'离校')
						}
						
						return h('div',[result])
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		watch: {
			'$store.state.card.refresh': function (val) {
				if(val){
					this.init_data()
					this.$store.commit('updateCard')
				}
			}
		},
		methods: {
			customAttend (type) {
				this.attendType = type
				
				this.sids = []
				
				this.$refs.students.openModal()
			},
			customAttendPost (value,leave) {
				if(!value.length){
					this.$Message.error('请先选择学员')
					return false
				}
				
				let params = {
						sids:value,
						int_day:moment(new Date()).format('YYYYMMDD'),
						is_push:1
					},
					msg = '操作成功！'
				
				
				if(this.attendType=='arrive'&&typeof leave=='undefined'){
					params.is_attend = 1
				}else{
					params.is_leave = 1
				}
				
				this.$rest('student_attend_school_logs').post(params)
				.success(data=>{
					this.$Message.success(msg)
					this.init_data()
					this.sids = []
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
				
			},
			showBtn (row) {
				let today = moment(new Date()).format('YYYYMMDD')
				if(row.int_day == today){
					if(_.isEmpty(row.student_attend_school_log)){					
						return true
					}else{
						return row.student_attend_school_log.is_leave===0
					}
				}
				return false
			},
			ok (row) {
				let field = 'is_attend'
				if(!_.isEmpty(row.student_attend_school_log)){
					if(row.student_attend_school_log.is_attend){
						field = 'is_leave'						
					}
					if(row.student_attend_school_log.is_attend&&row.student_attend_school_log.is_leave){
						this.$Message.error('您已经离校刷卡过，请勿重复刷卡')
						return
					}
				}
				
				let post = {
					sid: row.sid,
					int_day: moment(new Date()).format('YYYYMMDD'),					
				}
				post[field] = 1
				
				this.$rest('student_attend_school_logs')
				.post(post)
				.success(data=>{
					this.$Message.success('操作成功')
					this.init_data()
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'到校操作失败'
					})
				})
			},
			operateText (row) {
				let result = '到校'
				if(!_.isEmpty(row.student_attend_school_log)&&row.student_attend_school_log.is_attend === 1){
					result = '离校'
				}
				return result
			},
			schoolLog (type,row) {
				let map_text = {'attend':'未打卡','leave':'未打卡'},
					field = 'is_'+type,
					result = ''
				if(!_.isEmpty(row.student_attend_school_log)&&row.student_attend_school_log[field]){
					result = '已打卡'
				}else{
					result = map_text[type]
				}
				return result
			},
			getClass (type,row) {
				let map_class = {true:'text-success',false:'text-danger'},
					field = 'is_'+type,
					result = false
				if(!_.isEmpty(row.student_attend_school_log)&&row.student_attend_school_log[field]){
					result = true
				}
				
				return map_class[result]
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)			
				params.with = 'student'
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s,%s]',moment(property[0]).format('YYYYMMDD'),moment(property[1]).format('YYYYMMDD'))
						}
					}else{						
						if(property){
							params[o] = property	
						}		
					}									
				}
			},
			showSwipeModal() {
				this.$Modal.open('service/bclass/notice-swipe-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('到离校刷卡')
				})
			}
		}
	}
</script>

<style lang="less">

</style>