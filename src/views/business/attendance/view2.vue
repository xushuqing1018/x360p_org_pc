<template>
	<div  class="schedule-main m-0" style="min-height: 500px;">
		<div class="text-center padder">
			<Button type="text" icon="ios-arrow-back" @click="weekChange('prev')"></Button> 
			{{year}} 第{{week}}周
			<Button type="text" icon="ios-arrow-forward" @click="weekChange('next')"></Button>
		</div>
		<arrange-main 
			style="min-height: 500px;"
			:bid="bid$"
			:year="year"
			:week="week"
			:mode="mode"
			:action="action"
			:conditions="conditions"
			:arranges="arranges"
			@on-add-arrange=""
			@on-edit-arrange="showAttendModal"
			ref="main">				
		</arrange-main>
		<attendance-class-modal ref="attendance_record" @on-success="init_arranges(true)"></attendance-class-modal>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'		
	import arrangeMain from '../arrange/main.vue'
	import attendanceClassModal from './attendance-class-modal.vue'
	const CACHE = {}
	
	function clearCache(){
		for(let o in CACHE){
			delete CACHE[o]
		}
	}
	
	function getCurrentYear(){
		return util.int(moment().format('YYYY'))
	}
	
	function getCurrentWeek(){
		return util.int(util.get_date_week_no(new Date()))
	}
	
	function getCurrentDate(){
		return (new Date())
	}
	
	export default{
		mixins: [modal,common],
		components: {
			arrangeMain,
			attendanceClassModal
		},
		props: {
			
		},
		data () {
			return {
				loading:false,
				action:'list',
				mode:'list',
				currentDate:new Date(),
				year:getCurrentYear(),
				week:getCurrentWeek(),
				conditions:{
					lessons:{
						name:'lessons',
						text:'课程',
						key:'',
						current:{
							id:0,
							name:''
						}
					},
					subjects:{
						name:'subjects',
						text:'科目',
						key:'',
						current:{
							id:0,
							name:''
						}
					},
					teachers:{
						name:'teachers',
						text:'教师',
						key:'',
						current:{
							id:0,
							name:''
						}
					},
					classrooms:{
						name:'classrooms',
						text:'教室',
						key:'',
						current:{
							id:0,
							name:''
						}
					},
					object:{
						lesson_type:-1,
						id:0,
						lid:0
					},
					season:{
						value:'A'
					}
				},
				arranges:[]				
			}
		},
		watch: {
			
		},
		mounted(){
			this.init_season()
			this.init_arranges()
		},
		methods: {	
			init_season(){
				this.conditions.season.value = this.get_season_by_date(this.currentDate)
			},	
			//初始化排课数据
			init_arranges(refresh){
				return new Promise((resolve,reject)=>{
					let need_request = false
					let ck = ['arranges',this.bid$,this.year,this.week].join('-')
	
					if(refresh === true){
						need_request = true
					}else{
						if(CACHE[ck]){
							this.arranges = CACHE[ck]
							resolve(CACHE[ck])
							return
						}else{
							need_request = true
						}
					}
					if(need_request){
						this.loading = true
						this.$rest('course_arranges').get(this.dataParams)
						.success(response=>{
							this.loading = false
							CACHE[ck] = response.list
							this.arranges = response.list
							resolve(response.list)
						})
						.error(response=>{
							this.loading = false
							reject(response)
						})
					}
				})			
			},
			weekChange(action){
				let dt = this.currentDate.getDate()
				if(action == 'prev'){
					this.currentDate = new Date(this.currentDate.setDate(dt-7))
				}else{
					this.currentDate = new Date(this.currentDate.setDate(dt+7))
				}
				this.year = util.int(moment(this.currentDate).format('YYYY'))
				this.week = util.get_date_week_no(this.currentDate)
				
			},
			backList(){
				this.action = 'list'
				this.$store.commit('clearArrange')
			},
			refreshArrange(){
				clearCache()
				this.init_arranges(true)
			},
			showAttendModal (rs) {	
				let class_name = this.setTitle(rs.arrange),				
					title = util.sprintf('登记考勤【%s】',class_name)
					
				if(rs.arrange.is_attendance===2){
					title = util.sprintf('查看考勤【%s】',class_name)
				}
				
				this.$r('attendance_record')
				.set('course_arrange',rs.arrange)
				.set('ca_id',rs.arrange.ca_id)
				.show(title,'add')				
			},
			setTitle (item) {
				let result = '',
					mapTitle = {1:'一对一',2:'一对多'}
				
				if(item.lesson_type===0){
					if(item.is_trial===1||item.is_makeup===1){
						result = item.name
					}else{
						if(item.one_class!=null){
							result = item.one_class.class_name
						}	
					}	
				}else{
					result = mapTitle[item.lesson_type]
				}
							
				return result
			},	
		},
		computed:{
			dataParams(){
				let params = {}
				let week_date = util.weekdate(this.year,this.week)
				let start_int_day = moment(week_date.start).format('YYYYMMDD')
				let end_int_day   = moment(week_date.end).format('YYYYMMDD')
				params.int_day 	= util.sprintf('[between,%s,%s]',start_int_day,end_int_day)
				params.pagesize = 10000
				params.with = 'one_class,students'
				params.is_attendance = '[In,0,1]'
				return params
			}
		},
	}
</script>

<style>
</style>