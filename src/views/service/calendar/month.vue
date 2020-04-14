<template>
	<div class="c-grid">
		<div class="clearfix">
			<div class="pull-right">
	            <per-scope per="service_task.all" @on-change="perScopeChange"></per-scope>
	        </div>
		</div>
		<x-calendar 
			class="sc"
			first-day='1' 
			@changeMonth="changeMonth" 
			@eventClick="eventClick"
			@dayClick="dayClick" 
			@moreClick="moreClick"
			:events="events" 
			>
			<template slot="event-card" slot-scope="p">
				<p>{{p.event.title}}</p>
			</template>
			<span 
				class="add-icon" 
				slot="extra" 
				slot-scope="e" 
				@click.stop="addTask(e.event)"
				v-if="mode=='add'"
				>
				<Icon type="plus" size="14"></Icon>
			</span>
		</x-calendar>
		<div class="clearfix"></div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import XCalendar from 'c%/xcalendar'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import PerScope from 'c%/PerScope'
	export default {
		mixins:[common,globals],
		props: {
			mode:{
				type: String,
				default: 'add'
			}
		},
		components: {
			XCalendar,
			PerScope
		},
		data() {
			return {
				st: '',
				ed: '',
				type_service: 'all',
				events: []
			}
		},
		watch: {
			'type_service': function (val) {
				this.get_service_task(this.st, this.ed)
			}
		},
		methods: {
			get_service_task(start,end) {
				let url = 'service_tasks?pagesize=1000&with=student,one_class'
				url += '&int_day=[Between,'+start+','+end+']'
				if(this.type_service == 'my') {
					url += `&own_eid=${this.eid$}`
				}
				this.$http.get(url)
				.then(res => {
					this.events = []
					let list = res.body.data.list
					list.forEach(item=>{
						this.events.push(this.build_event(item))
					})
				})
			},
			build_event(item){
				let evt = {}
				let name = ''
				if(item.object_type==1 && item.student) {
					name = item.student.student_name
				}else if(item.object_type==2 && item.one_class) {
					name = item.one_class.class_name
				}else if(item.object_type==3) {
					name = this.$filter('branch_name')(item.bid)
				}
				evt.cssClass = []
				if(item.status == 1) {
					evt.cssClass.push('completed')
				}else{
					evt.cssClass.push('uncomplete')
				}
				evt.title = name+'：'+item.remark
				evt.start = moment(util.int_day_to_date(item.int_day)).format('YYYY-MM-DD')
				evt.end = evt.start
				evt.st = util.copy(item)
				return evt
			},
			addTask(e) {
				let currentDay = e.date.format('YYYY-MM-DD')
				this.$Modal.open('service/service/task-modal.vue',{
					props: {
						type: 1,
						'int-day': currentDay
					},
					on: {
						'on-success':() => {
							this.get_service_task(this.st, this.ed)
						}
					}
				})
				.then(modal => {
					modal.show('添加服务安排')
				})
			},
			changeMonth(start, end) {
				this.st = start.format('YYYY-MM-DD')
				this.ed = start.add(41,'days').format('YYYY-MM-DD')
				this.get_service_task(this.st, this.ed)
			},
			perScopeChange(v) {
				this.type_service = v
			},
			eventClick(event, jsEvent, pos) {
				let date = event.start
				this.$Modal.open('service/calendar/detail.vue@modal',{
					props: {
						'int-day': date,
						mode: this.mode
					},
					on: {
						'on-success':() => {
							this.get_service_task(this.st, this.ed)
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('【%s】服务安排',date))
				})
			},
			dayClick(day, jsEvent) {
				console.log('dayClick', day, jsEvent)
			},
			moreClick(day, events, jsEvent) {
				console.log('moreCLick', day, events, jsEvent)
			}
		}
	}
</script>
<style lang="less">
	.events-day {
		position: relative;
		.add-icon {
			position: absolute;
			bottom: 0;
			right: 0;
		}
		.completed {
			color: #fff !important;
			background: #19be6b !important;
		}
		.uncomplete {
			color: #fff !important;
			background: #5cadff !important;
		}
	}
</style>