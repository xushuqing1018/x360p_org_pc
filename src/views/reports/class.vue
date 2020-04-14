<template>
	<div class="c-grid">
	    <Tabs v-model="current_tab">
	    	<TabPane label="班级报表" name="number">
	    		<by-number v-if="current_tab=='number'"></by-number>
	    	</TabPane>
	    	<TabPane label="班级花名册" name="name">
	    		<by-name v-if="current_tab=='name'"></by-name>
	    	</TabPane>
	    	<TabPane :label="label_teacher_class" name="teacher">
	    	    <by-teacher v-if="current_tab=='teacher'"></by-teacher>
	    	</TabPane>
	    	<TabPane label="教室利用统计" name="room">
	    		<by-room v-if="current_tab=='room'"></by-room>
	    	</TabPane>
	    </Tabs>
	</div>
</template>
<script>
	import ByNumber from './class/by-number.vue'
	import ByName from './class/by-name.vue'
	import ByRoom from './class/by-room.vue'
	import ByTeacher from './class/by-teacher.vue'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [common],
		components: {
			ByNumber,
			ByName,
			ByRoom,
			ByTeacher
		},
		data() {
			return {
				current_tab: 'number'
			}
		}
	}
</script>