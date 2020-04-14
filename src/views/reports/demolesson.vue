<template>
	<div class="c-grid">
	    <Tabs v-model="current_tab">
	    	<TabPane label="按课程汇总" name="lesson">
	    		<by-lesson v-if="current_tab=='lesson'"></by-lesson>
	    	</TabPane>
	    	<TabPane label="按班级汇总" name="cid">
	    		<by-cid v-if="current_tab=='cid'"></by-cid>
	    	</TabPane>
	    	<TabPane :label="label_count_teacher" name="eid">
	    		<by-eid v-if="current_tab=='eid'"></by-eid>
	    	</TabPane>
	    </Tabs>
	</div>
</template>
<script>
	import ByLesson from './demo/by-lesson.vue'
	import ByEid from './demo/by-eid.vue'
	import ByCid from './demo/by-cid.vue'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common],
		components: {
			ByLesson,
			ByEid,
			ByCid,
		},
		data() {
			return {
				current_tab: 'lesson'
			}
		}
	}
</script>