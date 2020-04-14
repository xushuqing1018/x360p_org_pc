<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="650">
		<Button 
			type="primary" 
			size="small" 
			icon="log-in" 
			@click="swipeAttendPost('arrive')" 
			v-if="mode=='arrive'">
			到校刷卡
		</Button>
		<Button 
			type="primary" 
			size="small" 
			icon="log-out" 
			@click="swipeAttendPost('leave')" 
			v-else>
			离校刷卡
		</Button>
		<div>
			<Table 
				class="mt-2"
				height="450"
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
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins:[grid,modal,common],
		props: {
			mode: String,
			arrange: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data() {
			return {
				data:[],
				showIndex: false,
				column_keys: {
					student_name: {
						title: '学员',
						show: true
					},
					arrive: {
						title: '到校时间'
					},
					leave: {
						title: '离校时间'
					}
				},
				column_render: {
					student_name (h,params) {
						let map = {0:{icon:'help',text:'-'},1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}}
						let student = params.row.student
						return h('avatar-and-name',{
								attrs: {
									class: 'x-avatar-name'
								},
								props: {
									src: student.photo_url,
									name: student.student_name,
									sex: student.sex,
									sid: student.sid,
									nickname: student.nick_name,
									detailAction: 2
								} 
							}
						)
					},
					arrive (h,params) {
						let result = '-'
						let log = params.row.school_log
						if(log) {
							result = log.attend_time
						}else{
							if(this.arrange.int_day==moment().format('YYYYMMDD')) {
								result =  h('Button',{
									props: {
										type: 'primary',
										icon: 'log-in',
										size: 'small'
									},
									on: {
										click:() => {
											this.customAttendPost(params.row.sid,'arrive')
										}
									}
								},'到校')
							}
						}
						return h('div',[result])
					},
					leave (h,params) {
						let result = '-'
						let log = params.row.school_log
						if(log) {
							if(log.is_leave) {
								result = log.leave_time
							}else{
								if(this.arrange.int_day==moment().format('YYYYMMDD')) {
									result =  h('Button',{
										props: {
											type: 'primary',
											icon: 'log-out',
											size: 'small'
										},
										on: {
											click:() => {
												this.customAttendPost(params.row.sid,'leave')
											}
										}
									},'离校')
								}
							}
						}
						return h('div',[result])
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				this.get_school_log()
			},
			get_school_log() {
				this.$rest('student_attend_schoolLogs')
				.add_url_param(this.arrange.ca_id,'service')
				.get()
				.success(res => {
					this.data = res
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			swipeAttendPost(type) {
				this.$Modal.open(`dashboard/service/before/arrive-modal.vue`,{
					props: {
						mode: type
					},
					on: {
						'on-success':() => {
							this.get_school_log()
							this.$emit('on-success')
						}
					}
				})
				.then(modal=>{
					modal.show('刷卡')
				})
			},
			customAttendPost(sid,type) {
				let params = {
						sids:[sid],
						int_day:moment(new Date()).format('YYYYMMDD'),
						is_push:1
					},
					msg = ''
				
				
				if(type=='arrive'){
					params.is_attend = 1
					msg = '到校提醒成功'
				}else{
					params.is_leave = 1
					msg = '离校提醒成功'
				}
				
				this.$rest('student_attend_school_logs').post(params)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
					this.get_school_log()
				}).error(response=>{
					this.error(response.body.message)
				})
			}
		}
	}
</script>
