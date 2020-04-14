<style scoped>
.out-of-range {
	background-color: #eee;
	cursor: not-allowed;
	opacity: .5;
}

.teacher-time {
	position: relative;
}

.idle-tip {
	/* position:absolute;
	right:10px;
	font-size:11px; */
	color:#4dbd74;
	font-weight:bold;
}
</style>


<template>
	<div class="arrange-time-section-cell">
		<div class="unarrange-cell teacher-time" v-if="isInRange" @click.stop="switchStatus">
			<span :class="{ 'idle-tip':isIdle }">{{sectionObject.int_start_hour}}~{{sectionObject.int_end_hour}}</span>
			<!-- <span type="border" v-if="isIdle" color="green" class="idle-tip">可用</span> -->
		</div>
		<div class="unarrange-cell out-of-range" v-else @click.stop>
			<span>{{sectionObject.int_start_hour}}~{{sectionObject.int_end_hour}}</span>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [common,globals],
		props: {
			view: {
				type: String,
				default: ''
			},
			date: {
				type: Date
			},
			bid: {
				type: Number,
				default: 0
			},
			dayArranges:{
				type:Array,
				default(){
					return []
				}
			},
			dateRange:{
				type:Array,
				default(){
					return []
				}
			},
			teacherRangeData:{
				type:Array,
				default(){
					return []
				}
			},
			conditions:{
				type:Object,
				default(){
					return {}
				}
			},
			teachObject:{
				type: Object,
				default() {
					return {}
				}
			},
			sectionObject: {
				type: Object,
				default() {
					return {}
				}
			}
		},
		data() {
			return {
				tagName: '',
				objectFixed: {},
				ets_id: 0
			}
		},
		mounted() {
		},
		computed: {
			isIdle() {
				var isIdle = false;
				for (let index = 0; index < this.teacherRangeData.length; index++) {
					const item = this.teacherRangeData[index];
					if(item.eid == this.teachObject.eid
					&&item.int_day == parseInt(moment(this.date).format('YYYYMMDD'))
					&&item.int_start_hour == this.sectionObject.int_start_hour
					&&item.int_end_hour == this.sectionObject.int_end_hour) {
						isIdle = true;
						this.ets_id = item.ets_id;
						break;
					}
				}
				return isIdle;
			},
			isInRange() {
				var start = moment(this.dateRange[0]+'', "YYYYMMDD");
				var end = moment(this.dateRange[1]+'', "YYYYMMDD");
				var current = moment(this.date);
				if(current.isBetween(start,end)||current.isSame(start)||current.isSame(end)) {
					return true;
				}
				return false;
			},
			is_attend() {
				if(this.arrange.is_attendance==1) {
					return 'part-attendanced'
				}
				if(this.arrange.is_attendance==2) {
					return 'attendanced'
				}
				return ''
			},
			object_fixed() {
				let obj = {
					int_day: '',
					ts_array: [],
					teach_eid: 0,
					cr_id: 0
				}
				obj.int_day = moment(this.date).format('YYYY-MM-DD')
				obj.ts_array = [this.sectionObject.int_start_hour,this.sectionObject.int_end_hour]
				switch(this.view) {
					case 'teacher':
						obj.teach_eid = this.teachObject.eid;
						break;
					case 'classroom':
						obj.cr_id = this.teachObject.cr_id;
						break;
					case 'class':
						obj.class_item = this.teachObject;
						break;
					case 'one-to-one':
						obj.student_lesson_item = this.teachObject;
						break;
				}
				return obj
			},
			arrange() {
				let filter = (item) =>{
					switch(this.view) {
						case 'teacher':
							return this.teachObject.eid == item.teach_eid;
							break;
						case 'classroom':
							return this.teachObject.cr_id == item.cr_id;
							break;
						case 'class':
							return this.teachObject.cid == item.cid;
							break;
						case 'one-to-one':
							return item.lesson_type==1&&
								item.students.length>0&&
								this.teachObject.lid == item.lid&&
								this.teachObject.sid == item.students[0].sid;
							break;
					}
				}
				return this.dayArranges.find(filter)
			}
		},
		methods: {
			switchStatus() {
				if(this.isIdle) {
					this.$http.delete('employee_time_sections/'+this.ets_id)
					.then(res => {
						this.refreshData();
						this.$Message.success('取消可用成功')
					},res => {
						this.error(res.body.message)
					})
				}
				else {
					var vm = this;
					var arrayObj = {
						0: {
						bid: vm.bid,
						eid: vm.teachObject.eid,
						int_day: parseInt(moment(vm.date).format('YYYYMMDD')),
						int_start_hour: parseInt(vm.$filter('format_int_hour')(vm.sectionObject.int_start_hour)),
						int_end_hour: parseInt(vm.$filter('format_int_hour')(vm.sectionObject.int_end_hour)),
						week_day: vm.sectionObject.week_day
						}
					};
					this.$http.post('employee_time_sections',arrayObj)
					.then(res => {
						this.refreshData();
						this.$Message.success('设置可用成功')
					},res => {
						this.error(res.body.message)
					})
				}
			},
			showDetail() {
				this.$Modal.open('business/arrange/schedule/detail.vue@modal',{
					on: {
						'on-success':()=>{
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal.vuec
					.set('ca_id',this.arrange.ca_id)
					.show('排课详情','view')
				})
			},
			arrangeBySection() {
				this.$Modal.open('business/class/arrange/info-modal.vue',{
					props: {
						objectFixed: this.object_fixed
					},
					on: {
						'save':()=>{
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal.vuec.show('新增排课','add')
				})
			},
			refreshData() {
				this.$emit('on-refresh')
			},
			getTeachObject(data) {
				let result = ''
				if(data.lesson_type===0){
					if(data.is_trial===1||data.is_makeup===1){
						result = data.name
						this.tagName = data.is_trial===1?'试':'补'
					}else{
						if(data.one_class!=null){
							result = data.one_class.class_name
							this.tagName = '班'
						}	
					}	
				}else{
					let students = data.students
					if(data.lesson_type===1) {
						this.tagName = '一'
					}
					if(data.lesson_type===2) {
						this.tagName = '多'
					}
					if(data.lesson_type===3) {
						this.tagName = '研学'
					}
					if(data.students.length>0){
						data.students.forEach((s,i)=>{
							if(i<3){
								result += s.student.student_name+','
							}
						})
					}
					result = result.substring(0,result.length-1)
					if(data.students.length>3){
						result += '等'
					}
				}
				return result
			}
		}
	}
</script>