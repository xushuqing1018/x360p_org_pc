<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="1000">
		<div class="free-time-modal">
			<free-condition
				:year="year"
				:week="week"
				:cr-ids="crIds" 
				:date="date"
				:export-params="exportParams"
				@on-week-change="weekChange"
				@on-period-change="periodChange"
				@on-refresh="refreshData">
			</free-condition>
			<free-main
				ref="freeMain"
				:apn="apn"
				:year="year"
				:week="week"
				:cr-ids="crIds" 
				:date="date"
				:modal="modal$"
				@on-change-params="paramsChange">
			</free-main>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import FreeCondition from './ClassroomFreeTime/condition.vue'
	import FreeMain from './ClassroomFreeTime/main.vue'
	
	function getCurrentYear(){
		return util.int(moment().format('YYYY'))
	}

	function getCurrentWeek(){
		return util.int(util.get_date_week_no(new Date()))
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			FreeCondition,
			FreeMain
		},
		props: {
			crIds: {
				type: [Number,Array,String],
				default:() => {
					return []
				}
			}
		},
		data() {
			return {
				date: new Date(),
				year: getCurrentYear(),
				week: getCurrentWeek(),
				apn: ['a','p','n'],
				exportParams: {}
			}
		},
		methods: {
			weekChange({action}){
				let dt = this.date.getDate()
				if(action == 'prev'){
					this.date = new Date(this.date.setDate(dt-7))
				}else{
					this.date = new Date(this.date.setDate(dt+7))
				}
				this.year = util.int(moment(this.date).format('YYYY'))
				this.week = util.get_date_week_no(this.date)
				this.$refs.freeMain.getCourseData()
			},
			periodChange(apn) {
				this.apn = apn
			},
			refreshData(apn) {
				this.apn = apn
				this.date = new Date()
				this.year = util.int(moment(this.date).format('YYYY'))
				this.week = util.get_date_week_no(this.date)
				this.crIds.splice(0,this.crIds.length)
			},
			paramsChange(params) {
				this.exportParams = params
			}
		}
	}
</script>