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
			<TabPane label="按学员汇总" name="sid">
				<by-sid v-if="current_tab=='sid'"></by-sid>
			</TabPane>
			<TabPane label="按班级学员汇总" name="cts">
				<by-cts v-if="current_tab=='cts'"></by-cts>
			</TabPane>
		</Tabs>
	</div>
</template>
<script>
	import ByBid from './income/by-bid.vue'
	import ByLid from './income/by-lid.vue'
	import BySjid from './income/by-sjid.vue'
	import ByCid from './income/by-cid.vue'
	import ByEid from './income/by-eid.vue'
	import BySid from './income/by-sid.vue'
	import ByCts from './income/by-cts.vue'
	import common from '@/libs/common.mixin'
	export default {
		mixins:[common],
		components: {
			ByBid,
			ByLid,
			BySjid,
			ByCid,
			ByEid,
			BySid,
			ByCts
		},
		data() {
			return {
				current_tab: 'bid'
			}
		}
	}
</script>