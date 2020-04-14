<template>
	<div>
		<Tabs v-model="current_tab" type="card">
			<TabPane label="按状态" name="status"></TabPane>
			<TabPane label="按学校" name="school"></TabPane>
			<TabPane label="按课程" name="lid"></TabPane>
			<TabPane label="按班级" name="cid"></TabPane>
			<TabPane :label="label_count_teacher" name="eid"></TabPane>
		</Tabs>
		<by-status v-if="current_tab=='status'"></by-status>
		<by-school v-if="current_tab=='school'"></by-school>
		<by-lid v-if="current_tab=='lid'"></by-lid>
		<by-cid v-if="current_tab=='cid'"></by-cid>
		<by-eid v-if="current_tab=='eid'"></by-eid>		
	</div>	
</template>

<script>
	import common from '@/libs/common.mixin'
	import ByStatus from './by-status.vue'
	import BySchool from './by-school.vue'
	import ByLid from './by-lid.vue'
	import ByCid from './by-cid.vue'
	import ByEid from './by-eid.vue'
	
	export default{
		mixins: [ common ],
		components: {
			ByEid,
			ByLid,
			ByCid,
			ByStatus,
			BySchool
		},
		data () {
			return {
				current_tab: 'status'
			}
		}
	}
	
</script>