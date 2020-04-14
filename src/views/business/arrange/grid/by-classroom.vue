<template>
	<div class="week-schedule">
		<table ref="tableExcel" class="week-schedule-table mt-3">
			<table-header
				:view="view"
				:date="date" 
				:year="year"
				:week="week"
				@on-week-change="weekChange">
			</table-header>
			<table-body
				:view="view"
				:date="date" 
				:year="year"
				:week="week"
				:arranges="arranges"
				:conditions="conditions"
				@on-refresh="refreshData">
			</table-body>
		</table>
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import TableHeader from '../schedule/header.vue'
	import TableBody from './classroom-data.vue' 

	export default {
		mixins: [common],
		components: {
			TableHeader,
			TableBody
		},
		props: {
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
			}
		}
	}
</script>