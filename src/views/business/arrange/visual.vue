<style lang="less">
@import '~@/style/mixin.less';
.arrange-wrap{
	padding:10px;
	.rounded(5px);
	background:#fff;
	position:relative;
	min-height:540px;

}
</style>
<template>
	<div class="arrange-wrap">
		<div class="clearfix">
			<div class="pull-right mb-2">
	            <label>当前模式：</label>
	            <ButtonGroup>
	                <Button type="ghost" size="large" icon="ios-list-outline" @click="turnListArrange" style="padding:2px 5px">列表</Button>
	                <Button type="ghost" size="large" icon="grid" @click="turnGridArrange" style="padding:2px 5px">表格</Button>
	                <Button type="primary" size="large" icon="eye" style="padding:2px 5px">可视化</Button>
	            </ButtonGroup>
	        </div>
	    </div>
		<arrange-header 
		:bid="bid$" 
		:year="year"
		:week="week"
		:conditions="conditions" 
		:mode="mode" 
		:action="action"
		@on-week-change="weekChange"
		@on-clear-condition="clearConditionHandle"
		ref="header">
		</arrange-header>
		<arrange-condition 
		:bid="bid$"
		:conditions="conditions"
		:mode="mode"
		:action="action"
		:arranges="arranges"
		@on-select-condition="selectCondition"
		ref="condition">
		</arrange-condition>
		<arrange-main 
			:bid="bid$"
			:year="year"
			:week="week"
			:mode="mode"
			:action="action"
			:conditions="conditions"
			:arranges="arranges"
			@on-add-arrange="addArrange"
			@on-edit-arrange="editArrange"
			ref="main">
				<arrange-info
				:arranges="arranges"
				@on-close="backList"
				@on-save-success="refreshArrange"
				ref="info"
				:refs="$refs">
				</arrange-info>
		</arrange-main>
		<arrange-object
		@on-select-object="objectSelectHandle"
		@on-select-clear="objectClearHandle"
		:conditions="conditions"
		ref="object"
		>
		</arrange-object>
	</div>
</template>
<script>
import moment from 'moment'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import util from '@/libs/util'

import arrangeHeader from './header.vue'
import arrangeCondition from './condition.vue'
import arrangeMain from './main.vue'
import arrangeInfo from './info.vue'
import arrangeObject from './object.vue'

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
	name:'arrangeVisual',
	mixins:[common,globals],
	components:{
		arrangeHeader,
		arrangeCondition,
		arrangeMain,
		arrangeInfo,
		arrangeObject
	},
	data(){
		return {
			loading:false,
			mode:'view',			//模式查看或编辑 view,edit
			action:'list',			//操作动作 list,add,edit
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
						name:'',
						lesson_type:-1
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
	mounted(){
		this.init_season()
		this.init_arranges()
	},
	methods:{
		turnListArrange () {
            this.$emit('on-turn-mode','list')
        },
        turnGridArrange () {
        	this.$emit('on-turn-mode','grid')
        },
		init_season(){			
			let season = this.get_season_by_date(this.currentDate)
			
			let index = this.seasons.findIndex(s=>s.name==season) 
			if(index==-1){
				season = this.seasons[0].name
			}
			this.conditions.season.value = season
		},
		weekChange({action}){
			let dt = this.currentDate.getDate()
			if(action == 'prev'){
				this.currentDate = new Date(this.currentDate.setDate(dt-7))
			}else{
				this.currentDate = new Date(this.currentDate.setDate(dt+7))
			}
			this.year = util.int(moment(this.currentDate).format('YYYY'))
			this.week = util.get_date_week_no(this.currentDate)
//			this.conditions.season.value = this.get_season_by_date(this.currentDate)
			this.init_season()
		},
		clearConditionHandle(c){
			if(c == 'lessons'){
				this.$r('object').setLid(0)
			}
		},
		selectCondition({item,c}){
			if(this.action == 'list'){
				switch(c){
					case 'lessons':
						this.conditions.lessons.current.id   = item.lid
						this.conditions.lessons.current.name = item.lesson_name
						this.conditions.lessons.current.lesson_type = item.lesson_type
						this.clearSubjectIdNotInLessonSubjectIdScope(item.lid)
						this.$r('object').setLid(item.lid)
						break;
					case 'teachers':
						this.conditions.teachers.current.id   = item.eid
						this.conditions.teachers.current.name = item.ename
						break;
					case 'classrooms':
						this.conditions.classrooms.current.id = item.cr_id
						this.conditions.classrooms.current.name = item.room_name
						break;
					case 'subjects':
						this.conditions.subjects.current.id   = item.sj_id
						this.conditions.subjects.current.name = item.subject_name

						break;
				}
			}
			if(this.action == 'add' && this.conditions[c].current.id == 0){
				switch(c){
					
					case 'teachers':
						this.$r('info').setInfoData('teach_eid',item.eid,'add')
						break;
					case 'subjects':
						this.$r('info').setInfoData('sj_id',item.sj_id,'add')
						break;
					case 'classrooms':
						this.$r('info').setInfoData('cr_id',item.cr_id,'add')
						break;
				}
			}
			if(this.action == 'edit' && this.conditions[c].current.id == 0){
				switch(c){
					case 'teachers':
						this.$r('info').setInfoData('teach_eid',item.eid,'edit')
						break;
					case 'subjects':
						this.$r('info').setInfoData('sj_id',item.sj_id,'edit')
						break;
					case 'classrooms':
						this.$r('info').setInfoData('cr_id',item.cr_id,'edit')
						break;
				}
			}
		},
		objectSelectHandle(obj){
			this.conditions.object.lesson_type = obj.type
			this.conditions.object.id = obj.id
			this.conditions.object.lid = obj.lid
		},
		objectClearHandle(){
			this.conditions.object.lesson_type = -1
			this.conditions.object.id = 0
			this.conditions.object.lid = 0
		},
		//清除不在课程科目范围内的科目条件选择
		clearSubjectIdNotInLessonSubjectIdScope(lid){
			if(this.conditions.subjects.current.id == 0){
				return
			}
			let lesson = this.getLessonObj(lid)
			let sj_ids = []
			if(lesson.sj_id != 0){
				sj_ids.push(lesson.sj_id)
			}else{
				for(let i=0,l=lesson.sj_ids.lengh;i<l;i++){
					sj_ids.push(util.int(lesson.sj_ids[i]))
				}
			}
			if(sj_ids.indexOf(this.conditions.subjects.current.id) === -1){
				this.conditions.subjects.current.id = 0
			}
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
		addArrange(input){
			this.action = 'add'
			let info = this.$r('info').setAction('add').initInfo().setTs(input.ts)
			if(input.data){
				info.setAddField(input.data)
			}
			if(this.conditions.teachers.current.id != 0){
				info.setInfoData('teach_eid',this.conditions.teachers.current.id)
			}
			if(this.conditions.classrooms.current.id != 0){
				info.setInfoData('cr_id',this.conditions.classrooms.current.id)
			}
			info.show('创建排课').updateStore()
		},
		editArrange({arrange,ts}){
			let info = util.copy(arrange)
			if(info.lesson_type == 0){
				info._class_name = info.one_class.class_name
				delete info.one_class
			}
			info.int_start_hour = this.$filter('int_hour')(info.int_start_hour)
			info.int_end_hour = this.$filter('int_hour')(info.int_end_hour)
			this.action = 'edit'
			this.$r('info')
			.setTs(ts)
			.setInfo(info)
			.show('编辑排课','edit')
			.updateStore()
		},
		backList(){
			this.action = 'list'
			this.$store.commit('clearArrange')
		},
		refreshArrange(){
			clearCache()
			this.init_arranges(true)
			this.$r('object').refreshDataList()
		}
	},
	computed:{
		seasons(){
	    	return this.$store.state.gvars.dicts.season
	    },
		dataParams(){
			let params = {}
			let week_date = util.weekdate(this.year,this.week)
			let start_int_day = moment(week_date.start).format('YYYYMMDD')
			let end_int_day   = moment(week_date.end).format('YYYYMMDD')
			params.int_day 	= util.sprintf('[between,%s,%s]',start_int_day,end_int_day)
			params.pagesize = 10000
			params.with = 'one_class,students'
			return params
		}
	},
	watch:{
		week(){
			this.init_arranges()
		}
	}
}
</script>