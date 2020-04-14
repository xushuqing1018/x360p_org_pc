<template>
	<div :class="{
		'week-schedule':dateMode == 'week',
		'day-schedule':dateMode == 'day'
	}">
		<template v-if="dateMode == 'week'">
			<table ref="tableExcel" class="week-schedule-table mt-3">
				<table-header
					:view="view"
					:date="date" 
					:year="year"
					:week="week"
					:allow-day-click="1"
					@on-day-click="dayClick"
					@on-week-change="weekChange">
				</table-header>
				<table-body
					:view="view"
					:date="date" 
					:year="year"
					:week="week"
					:per-scope="perScope"
					:arranges="arranges"
					:conditions="conditions"
					@on-refresh="refreshData">
				</table-body>
			</table>
		</template>
		<day-schedule
		v-if="dateMode == 'day'"
		:date="date"
		:season="conditions.season"
		>
		</day-schedule>

	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import TableHeader from '../schedule/header.vue'
	import TableBody from './one-to-one-data.vue' 
	import daySchedule from './day-schedule.vue'

	export default {
		mixins: [common],
		components: {
			TableHeader,
			TableBody,
			daySchedule
		},
		props: {
			perScope: {
				type: String,
				default: ''
			},
			view: {
				type: String,
			},
			date: {
				type: Date
			},
			year:{
				type:Number,
				default:0
			},
			week:{
				type:Number,
				default:1
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
			dateMode:{
				type:String,
				default:'week'
			}
		},
		data() {
			return {
				
			}
		},
		methods: {
		    weekChange({action}) {
				this.$emit('on-week-change',{action:action})
		    },
		    refreshData() {
				this.$emit('on-refresh')
			},
			dayClick(dt){
				this.$emit('on-date-mode-change',{date:dt,mode:'day'})
			}
		}
	}
</script>