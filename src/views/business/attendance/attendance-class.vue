<template>
	<div>
    	<attendance-class-list-one v-if="class_attendance_list_mode == 0"></attendance-class-list-one>
		<attendance-class-list-two v-if="class_attendance_list_mode == 1"></attendance-class-list-two>
	</div>
</template>

<script>
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import attendanceClassListOne from './attendance/attendance-class-list-one.vue'
	import attendanceClassListTwo from './attendance/attendance-class-list-two.vue'
	export default{
		mixins: [common,globals],
		components:{
			attendanceClassListOne,
			attendanceClassListTwo
		},
		data () {
			return {
			}
		}
	}
</script>