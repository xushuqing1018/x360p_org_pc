<template>
	<div class="navbar-task ml-3">
		<Badge dot :title="'有'+data.length+'条待办服务'" :count="data.length">
        	<Icon class="nav-icon" type="ios-bell" size="18" @click.native="showServiceTask"></Icon>
   		</Badge>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [ grid, common, globals ],
		data () {
			return {
				rest_api: 'service_tasks',
				pk: 'st_id',
				map_status: {'0':'待办','1':'完成','-1':'取消'},
				interval: null,
			}
		},
		mounted () {
			this.getData()
		},
		beforeDestroy () {
			if(this.interval){
				window.clearTimeout(this.interval)
			}
		},
		methods: {
			getData () {
				this.init_data()
				
				this.interval = setTimeout(()=>{
					this.getData()
				},30000)
			},
			isOverDue (item) {
				let time = this.$filter('int_date')(item.int_day) + ' ' + this.$filter('int_hour')(item.int_hour)
				return moment(new Date()).isAfter(time)
			},
			getServiceObj (item) {
				let result = ''
				if(item.cid > 0){
					result = item.one_class?item.one_class.class_name:''
				}else if(item.sid > 0){
					result = item.student?item.student.student_name:''
				}else if(item.cu_id > 0){
					result = item.customer?item.customer.name:''
				}
				
				return result
			},
			hook_get_param (params) {
				params.status = 0
				params.own_eid = this.eid$
				params.with = 'student,one_class,customer'
			},
			editInfo (item) {
				let title = util.sprintf('更新服务安排【%s】',this.getServiceObj(item))
				
				this.$Modal.open('service/service/task-modal.vue',{
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',item)
					.show(title,'edit')
				})
			},
			showServiceTask() {
				this.$Modal.open('common/task-modal.vue')
				.then(modal => {
					modal.show('我的任务')
				})
			}
		}
	}
</script>

<style>
</style>