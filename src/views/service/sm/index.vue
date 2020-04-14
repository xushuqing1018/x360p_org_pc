<template>
	<Tabs>
		<TabPane label="学员列表" name="student" v-if="hasPer('study.student')">
			<tab-student ref="student"></tab-student>
		</TabPane>
		<TabPane label="登录情况" name="log" v-if="hasPer('study.log')">
			<tab-log ref="log"></tab-log>
		</TabPane>
		<TabPane label="界面设置" name="ui" v-if="hasPer('study.ui')">
			<tab-ui ref="ui"></tab-ui>
		</TabPane>
		<TabPane label="学员回评" name="reply" v-if="hasPer('study.reply')">
			<tab-reply ref="reply"></tab-reply>
		</TabPane>
		<TabPane label="投诉建议" name="complaint" v-if="hasPer('study.complaint')">
			<tab-complaint ref="complaint"></tab-complaint>
		</TabPane>
	</Tabs>
</template>

<script>
	import common from '@/libs/common.mixin'
	import tabUi from './tab-ui.vue'
	import tabLog from './tab-log.vue'
	import tabStudent from './tab-student.vue'
	import tabComplaint from './tab-complaint.vue'
	import tabReply from './tab-reply.vue'
	
	export default{
		mixins: [ common ],
		components: {
			tabUi,
			tabLog,
			tabStudent,
			tabComplaint,
			tabReply
		},
		data () {
			return {
				tab: 'student'
			}
		}
	}
</script>

<style>
</style>