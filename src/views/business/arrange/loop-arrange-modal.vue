<template>
	<Modal v-model="modal$.show" :title="modal$.title" :width="width" :mask-closable="false" v-drag-modal @on-cancel="cancel">	
		<div class="mb-3" v-if="avoid_holidays.length>0">
			<Card dis-hover>			
				<span slot="title">跳过节假日</span>
				<div class="holiday-list row">
					<div class="item col-sm-4" v-for="item in avoid_holidays">
						<strong class="text-info">{{item.int_day}}</strong>
						<span class="ml-3">{{item.name}}</span>
					</div>
				</div>
			</Card>			
		</div>
		
		<div style="max-height:450px;overflow-y: auto;margin:0 -15px;">
			<table class="modal-table">
	    		<thead>
	    			<th><div class="ivu-table-cell">授课对象</div></th>
	    			<th><div class="ivu-table-cell">时间</div></th>
	    			<th><div class="ivu-table-cell">周数</div></th>
	    			<th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>	    			
	    			<th><div class="ivu-table-cell">教室</div></th>
	    		</thead>
	    		<tr v-for="item in loop_arranges">
	    			<td>
	    				<div class="ivu-table-cell">
	    					<template v-if="data.lesson_type == 0 && data.is_trial == 0">
	    						<Tag type="border" color="blue" v-if="data.cid != 0">班课</Tag>
		    					<Tag v-if="data.cid != 0">{{data._class_name}}</Tag>
							</template>
							<Tag type="border" color="yellow" v-if="data.is_trial == 1">{{data.name}}</Tag>
							<template v-else>
								<Tag type="border" color="green" v-if="data.lesson_type == 1">1对1</Tag>
								<Tag type="border" color="green" v-if="data.lesson_type == 2">1对多</Tag>
							</template>
							<Tag v-for="(s,index) in data.students">
								{{s.student_name}}
							</Tag>
	    				</div>
	    			</td>
	    			<td><div class="ivu-table-cell">{{item.int_day}}  {{data.int_start_hour}} ~ {{data.int_end_hour}}</div></td>
	    			<td><div class="ivu-table-cell">{{getWeekNo(item.int_day)}}</div></td>
	    			<td><div class="ivu-table-cell">{{item.teach_eid|employee_name}}</div></td>
	    			<td><div class="ivu-table-cell">{{item.cr_id|classroom_name('请从排课条件选择教室')}}</div></td>
	    		</tr>
	    	</table>
    	</div>
		
		<div slot="footer">
			<Button type="ghost" @click="cancel">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [common,globals,modal],
		props: {
			weekType: {
				type: [String,Number],
				default: 0
			},
			data: {
				type:Object,
				default(){
					return {
						lesson_type:-1,
						lid:0,
						name:'',
						_class_name:'',
						sj_id:0,
						int_day:'',
						int_start_hour:'',
						teach_eid:0,
						cr_id:0,
						isloop:0,
						loop_times:0,
						loop_arranges:[],
						students:[
						]
					}
				}
			},			
		},
		data () {
			return {
				loop_arranges: [],
				avoid_holidays: [],
				width: 800,
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					this.pre_loop_arranges()
				}
			}
		},
		methods: {
			cancel () {
				this.close()
			},
			getWeekNo (int_day) {
				return util.get_date_week_no(util.new_date(int_day))
			},
			avoidHolidays (int_day) {
				let holidays = this.$store.state.gvars.holidays
				
				if(holidays.length){
					let holiday = holidays.find(h=>h.int_day==int_day)
					if(holiday){
						//避开节假日列表
						this.avoid_holidays.push(holiday)
						int_day = moment(int_day).add(7,'days').format('YYYY-MM-DD')
						
						if(holidays.find(h=>h.int_day==int_day)){
							int_day = this.avoidHolidays(int_day)
						}
					}	
				}
				
				return int_day				
			},
			pre_loop_arranges () {
				let times = this.data.loop_times,
					start_day = this.$filter('int_date')(this.data.int_day),
					int_start_hour = this.data.int_start_hour,
					int_end_hour = this.data.int_end_hour,
					holidays = this.$store.state.gvars.holidays,
					loop_date_arranges = [],
					weekType = this.weekType
					
				this.avoid_holidays = []					
				this.loop_arranges = []
				
				if(typeof this.data.int_day == 'string'){
					start_day = this.data.int_day
				}
				
				if(times>0){
					for(let i=0;i<times;i++){
						let start_date = loop_date_arranges[loop_date_arranges.length-1] || start_day,
							temp_date = moment(start_date).add(7,'days').format('YYYY-MM-DD'),
							obj = util.copy(this.data)
							
							//以data.int_day为第一次排课日期
							if(i===0){
								temp_date = moment(start_date).format('YYYY-MM-DD')
							}
							
						temp_date = this.avoidHolidays(temp_date)				
						
						let weekno = util.get_date_week_no(util.new_date(temp_date))
						
						//1、排课类型为单周但temp_date为双周时  需要加7天
						//2、排课类型为双周但temp_date为单周时  需要加7天
						if((weekType==1&&weekno%2==0)||(weekType==2&&weekno%2==1)){
							temp_date = moment(temp_date).add(7,'days').format('YYYY-MM-DD')
						}						
						
						loop_date_arranges.push(temp_date)
						
						//循环排课日期列表
						Vue.set(obj,'int_day',temp_date)
						Vue.delete(obj,'loop_times')
						Vue.delete(obj,'loop_arranges')
						
						this.loop_arranges.push(obj)
					}				
				}
				this.data.loop_arranges = this.loop_arranges
			},
		}
	}
</script>
