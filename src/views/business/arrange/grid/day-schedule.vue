<style lang="less">
.day-schedule-wrap{
	width:100%;
	min-height:400px;
	position:relative;
}
.xt{
	th,td{
		border-collapse:collapse;
		border:1px solid #eee;
		text-align:center;
	}
}
.xt-header{
	th,td{
		height:26px;
		line-height:26px;
	}
}
.xt-body{
	th,td{
		height:30px;
		line-height:30px;
	}
}
.xt-header-side-left{
	th{
		width:100px;
	}
}
.xt-header-main{
	th{
		width:60px;
		>div{
			width:58px;
			display:block;
			word-break: keep-all;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
		}
	}
}

.xt-header-side-left{
	width:100px;
}
.xt-body-side-left{
	th{
		font-weight:bold;
		width:100px;
	}
}
.xt-body-main{
	td{
		width:60px;
		>div{
			width:58px;
			cursor:point;
			display:block !important;
			word-break: keep-all;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
		}
		.cell-info{
			color:#ffffff;
		}
		.cell-arranged{
			background:#50a8ff;
		}
		.cell-attendanced{
			background:#19be6b;
		}
		.cell-absence{
			color:#ff0000;
		}
		.cell-leave{
			color:#000000;
		}
		.ivu-poptip-rel{
			display:block;
		}
	}
}
.day-schedule-side{
	position:absolute;
	left:0;
	top:0;
	width:99px;
	overflow:scroll;
}

.day-schedule-main{
	margin-left:100px;
	overflow:scroll;
}


</style>
<template>
	<div>
		<div class="day-schedule-header">
	    	<Tag v-for="eid in hidden_eids" 
	    	:key="eid" 
	    	:name="eid" 
	    	closable 
	    	@on-close="removeHiddenEid">{{eid|ename}}
	    	</Tag>
	    </div>
		<div class="day-schedule-wrap">
			
			<Spin fix v-if="loading">
	            <Icon type="load-c" size="18" class="loading-spin"></Icon>
	            <div>正在加载排课数据...</div>
	        </Spin>

	        <div class="day-schedule-side">
				<table class="xt xt-header xt-header-side-left">
					<thead>
						<tr>
							<th>时间段</th>
						</tr>
					</thead>
				</table>
				<table class="xt xt-body xt-body-side-left">
					<tbody>
						<tr v-for="(item,index) in ts">
							<th>
							{{item.int_start_hour}}~{{item.int_end_hour}}
							</th>
						</tr>
						<tr v-if="emptyTs">
							<th>-</th>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="day-schedule-main">

				<table class="xt xt-header xt-header-main" :width="headerWidth">
					<thead>
						<tr>
							<th v-for="(item,index) in teachers">
								<div>
									{{item.ename}}
									<Icon type="ios-close-empty" v-if="tl>1" @click="addHiddenEid(item.eid)"></Icon>
								</div>
							</th>
						</tr>
					</thead>
				</table>
				<table class="xt xt-body xt-body-main" :width="headerWidth">
					<tbody>
						<tr v-for="(ts,ti) in ts">
							<day-schedule-cell 
							v-for="(employee,ei) in teachers"
							:teacher="employee"
							:ts="ts"
							:date="date"
							:arranges="teacher_arranges[employee.eid]"
							@on-add-arrange="addArrange"
							@on-view-arrange="viewArrange"
							>
							</day-schedule-cell>
						</tr>
						<tr v-if="emptyTs">
							<td :colspan="colspan">
								<p>当前日期没有配置时间段,请在【系统】【基础设置】【时间段设置】进行设置.</p>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import dayScheduleCell from './day-schedule-cell.vue'

	const CACHE_KEY = '__HIDDEN_EIDS__'
	
	export default {
		mixins: [common,globals],
		components: {
			dayScheduleCell
		},
		props: {
			date: {
				type: Date
			},
			season:{
				type:String,
				default:'A'
			}
		},
		data() {
			return {
				loading:false,
				arranges:[],
				teacher_arranges:{},
				hidden_eids:[],
				conditions:{
					teachers:{
						key:''
					}
				}
			}
		},
		created(){
			this.recoverCachedHiddenEid()
		},
		mounted(){
			this.init_arranges()
		},
		watch:{
			date(oldval,newval){
				this.init_arranges()
			}
		},
		computed:{
			headerWidth(){
				return this.teachers.length * 60
			},
			colspan(){
				return this.teachers.length
			},
			// 某个期段某一天的上课时间段
			ts(){
				let time_sections = []
				let week_day = util.get_week_day(this.date)
				let season   = this.season
				
				let season_time_sections = this.get_time_sections(week_day,season)	
				time_sections = season_time_sections
				return this.orderBy(time_sections,'int_start_hour')
			},
			all_teachers(){
				let lists = this.$store.state.gvars.employees||[]
				let bid   = this.bid$
				let rid   = 1		//老师角色是1
				let hidden_eids = this.hidden_eids
				function filter(key,bid,rid){
					if(!/^\s*$/.test(key)){
						return function(item){
							return item.rids.indexOf(rid) !== -1 && item.bids.indexOf(bid) !== -1 && item.ename.indexOf(key) !== -1
						}
					}else{
						return function(item){
							return item.rids.indexOf(rid) !== -1 && item.bids.indexOf(bid) !== -1 
						}
					}
				}
				return lists.filter(filter(this.conditions.teachers.key,bid,rid))
			},
			teachers(){
				let lists = this.$store.state.gvars.employees||[]
				let bid   = this.bid$
				let rid   = 1		//老师角色是1
				let hidden_eids = this.hidden_eids
				function filter(key,bid,rid){
					if(!/^\s*$/.test(key)){
						return function(item){
							return hidden_eids.indexOf(item.eid) === -1 && item.is_on_job == 1 && item.rids.indexOf(rid) !== -1 && item.bids.indexOf(bid) !== -1 && item.ename.indexOf(key) !== -1
						}
					}else{
						return function(item){
							return hidden_eids.indexOf(item.eid) === -1 && item.is_on_job == 1 && item.rids.indexOf(rid) !== -1 && item.bids.indexOf(bid) !== -1 
						}
					}
				}
				return lists.filter(filter(this.conditions.teachers.key,bid,rid))
			},
			emptyTs(){
				return this.ts.length == 0
			},
			tl(){
				return this.teachers.length
			}
		},
		methods: {
		   init_arranges(){
		   		this.loading = true
		   		this.$rest('course_arranges')
		   		.get({
		   			page:1,
		   			pagesize:1000,
		   			bid:this.bid$,
		   			with:'students',
		   			lesson_type:1,
		   			int_day:moment(this.date).format('YYYYMMDD')
		   		})
		   		.success(response=>{
		   			this.loading = false
		   			this.arranges = response.list
		   			this.init_teacher_arranges()
		   		})
		   		.error(response=>{
		   			this.loading = false
		   			this.$Message.error('数据加载失败~')
		   		})
		   },
		   init_teacher_arranges(){
		   		this.teacher_arranges = {}
		   		this.all_teachers.forEach(item=>{
		   			this.teacher_arranges[item.eid] = []
		   		})
		   		this.arranges.forEach(item=>{
		   			if(typeof this.teacher_arranges[item.teach_eid] != 'undefined'){
			   			this.teacher_arranges[item.teach_eid].push(item)
			   		}
		   		})
		   },
		   addArrange(input){
		   		this.$Modal.open('business/class/arrange/info-modal.vue',{
					props: {
						objectFixed: input
					},
					on: {
						'save':()=>{
							this.init_arranges()
						}
					}
				})
				.then(modal => {
					modal.vuec.show('新增排课','add')
				})
		   },
		   viewArrange(arrange){
				this.$Modal.open('business/arrange/schedule/detail.vue@modal',{
					on: {
						'on-success':()=>{
							this.init_arranges()
						}
					}
				})
				.then(modal => {
					modal.vuec
					.set('ca_id',arrange.ca_id)
					.show('排课详情','view')
				})
		   },
		   addHiddenEid(eid){
		   	if(this.hidden_eids.indexOf(eid) === -1){
		   		this.hidden_eids.push(eid)
		   		this.cacheHiddenEid()
		   	}
		   },
		   removeHiddenEid(e,name){
		   	let index = this.hidden_eids.indexOf(name)
		   	if(index !== -1){
		   		this.hidden_eids.splice(index,1)
		   		this.cacheHiddenEid()
		   	}
		   }, 
		   recoverCachedHiddenEid(){
		   		let eids = this.getCache(CACHE_KEY)
		   		let hidden_eids = []
		   		if(eids !== null && eids != ''){
		   			hidden_eids = eids.split(',')
		   		}
		   		hidden_eids.forEach(item=>{
		   			this.hidden_eids.push(util.int(item))
		   		})
		   },
		   cacheHiddenEid(){
		   	let value = this.hidden_eids.join(',')
		   	this.setCache(CACHE_KEY,value)
		   }
		}
	}
</script>