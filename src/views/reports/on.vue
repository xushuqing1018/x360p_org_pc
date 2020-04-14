<template>
	<div class="c-grid">
	    <Tabs v-model="current_tab">
	    	<!-- <TabPane label="按校区汇总" name="bid">
	    		<by-bid v-if="current_tab=='bid'"></by-bid>
	    	</TabPane> -->
	    	<TabPane label="在读学员统计表" name="summary">
	    		<by-student v-if="current_tab=='summary'"></by-student>
	    		 		
	    	</TabPane>
	    	<!--<TabPane label="按状态汇总" name="status">
	    		<by-status v-if="current_tab=='status'"></by-status>
	    	</TabPane>
	    	<TabPane label="按学校汇总" name="school">
	    		<by-school v-if="current_tab=='school'"></by-school>
	    	</TabPane>
	    	<TabPane label="按课程汇总" name="lid">
	    		<by-lid v-if="current_tab=='lid'"></by-lid>
	    	</TabPane>
	    	<TabPane label="按班级汇总" name="cid">
	    		<by-cid v-if="current_tab=='cid'"></by-cid>
	    	</TabPane>
	    	<TabPane :label="label_count_teacher" name="eid">
	    		<by-eid v-if="current_tab=='eid'"></by-eid>
	    	</TabPane>-->
	    	<TabPane label="在读学员明细表" name="detail">
	    		<on-detail v-if="current_tab=='detail'"></on-detail>
	    	</TabPane>
	    	<TabPane label="汇总统计表" name="student">	    		
	    		<Summary v-if="current_tab=='student'"></Summary>	   
	    	</TabPane>
			<TabPane label="学生流失表" name="lost">
	    		<by-lost v-if="current_tab=='lost'"></by-lost>
	    	</TabPane>
	    	<TabPane label="学员未分班课程" name="nocid">
	    		<no-cid v-if="current_tab=='nocid'"></no-cid>
	    	</TabPane>
	    	<TabPane label="剩余课时报表" name="remainlessonhour">
	    		<remain-lesson-hour v-if="current_tab=='remainlessonhour'"></remain-lesson-hour>
	    	</TabPane>
	    </Tabs>
	</div>
</template>
<script>
	import ByBid from './on/by-bid.vue'
	import NoCid from './on/no-cid.vue'	
	import ByLost from './on/by-lost.vue'
	import ByStudent from './on/by-student.vue'
	import OnDetail from './on/on-detail.vue'
	import Summary from './on/summary.vue'
	import RemainLessonHour from './on/remain-lesson-hour.vue'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [common],
		components: {
			ByBid,
			NoCid,
			ByLost,
			OnDetail,
			Summary,
			ByStudent,
			RemainLessonHour
		},
		data() {
			return {
				current_tab: 'summary'
			}
		}
	}
</script>