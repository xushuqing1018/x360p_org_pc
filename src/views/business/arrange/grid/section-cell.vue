<template>
	<div class="arrange-time-section-cell">
		<div 
		class="arranged-cell" 
		:class="{
			'cancel':arrange.is_cancel == 1,
			'part-attendanced':arrange.is_attendance == 1,
			'attendanced':arrange.is_attendance == 2
		}" 
		v-if="arrange" 
		@click.stop="showDetail">
			<div>{{sectionObject.int_start_hour}}~{{sectionObject.int_end_hour}}</div>
			<div v-if="!(view=='class'||view=='one-to-one')">
				<span class="lesson-type">{{tagName}}</span>
				<span>{{getTeachObject(arrange)}}</span>
			</div>
			<div>
			<Icon type="android-bookmark"></Icon>
				<span>{{arrange.lid|lesson_name}}/ {{arrange.sj_id|subject_name}}</span>
			</div>
			<div>
				<template v-if="view!=='teacher'">
					<Icon type="ios-person"></Icon>
					<span>{{arrange.teach_eid|ename('未知')}}</span>&nbsp;
				</template>
				<template v-if="view!=='classroom'">
					<Icon type="home"></Icon>
					<span>{{arrange.cr_id|classroom_name('未知')}}</span>
				</template>
			</div>
		</div>
		<div class="unarrange-cell" @click.stop="arrangeBySection" v-else>
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
			arranges:{
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
				objectFixed: {}
			}
		},
		computed: {
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
			},
			dayArranges() {
				let section = this.sectionObject
				return this.arranges.filter(item => moment(this.date).format('YYYYMMDD') == item.int_day
								&&section.int_start_hour == this.$filter('int_hour')(item.int_start_hour)
									&&section.int_end_hour == this.$filter('int_hour')(item.int_end_hour))
			}
		},
		methods: {
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