<template>
    <div class="c-grid">
    	<Tabs v-model="current_tab">
    		<TabPane label="按校区汇总" name="bid">
    			<by-bid v-if="current_tab=='bid'"></by-bid>
    		</TabPane>
    		<TabPane label="按课程汇总" name="lid">
    			<by-lid v-if="current_tab=='lid'"></by-lid>
    		</TabPane>
    		<TabPane label="按科目汇总" name="sj_id">
    			<by-sjid v-if="current_tab=='sj_id'"></by-sjid>
    		</TabPane>
    		<TabPane label="按班级汇总" name="cid">
    			<by-cid v-if="current_tab=='cid'"></by-cid>
    		</TabPane>
    		<TabPane :label="label_count_teacher" name="eid">
    			<by-eid v-if="current_tab=='eid'"></by-eid>
    		</TabPane>
			<TabPane label="按助教汇总" name="second_eid">
				<by-secondeid v-if="current_tab=='second_eid'"></by-secondeid>
			</TabPane>
			<TabPane label="按学管师汇总" name="learning_eid">
				<by-learningeid v-if="current_tab=='learning_eid'"></by-learningeid>
			</TabPane>
    		<TabPane label="按学员汇总" name="sid">
    			<by-sid v-if="current_tab=='sid'"></by-sid>
    		</TabPane>
    		<TabPane label="按考勤方式汇总" name="att_way">
    			<by-att-way v-if="current_tab=='att_way'"></by-att-way>
    		</TabPane>
    	</Tabs>
    </div>
</template>
<script>
	import ByBid from './attendance/by-bid.vue'
	import ByLid from './attendance/by-lid.vue'
	import BySjid from './attendance/by-sjid.vue'
	import ByCid from './attendance/by-cid.vue'
	import ByEid from './attendance/by-eid.vue'
	import BySecondeid from './attendance/by-secondeid.vue'
	import ByLearningeid from './attendance/by-learningeid.vue'
	import BySid from './attendance/by-sid.vue'
	import ByAttWay from './attendance/by-att-way.vue'
    import common from '@/libs/common.mixin'
	export default {
        mixins:[common],
		components: {
			ByBid,
			ByLid,
			BySjid,
			ByCid,
			ByEid,
			BySecondeid,
			ByLearningeid,
			BySid,
			ByAttWay
		},
		data() {
			return {
				current_tab: 'bid'
			}
		}
	}
</script>