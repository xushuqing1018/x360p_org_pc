<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="1000" :mask-closable="false">
		<Tabs v-model="tab">
			<TabPane name="leave" label="请假">
				<arrange-record ref="ref_leave" @on-tab-change="tabChange" @on-sid-change="sidChange" :sid="sid" :name="name" :modal-leave="modal$"></arrange-record>
			</TabPane>
			<TabPane name="record" label="请假记录">
				<leave-record :modal-leave="modal$" :sid="sid" v-if="tab=='record'"></leave-record>
			</TabPane>
			<TabPane name="warn" label="请假预警">
				 <leave-warn :modal-leave="modal$"></leave-warn>
			</TabPane>
		</Tabs>
		
		<div slot="footer">
			<template v-if="tab=='leave'">
				<Button type="ghost" @click="close">取消</Button>
				<Button type="primary" @click="ok">确定</Button>
			</template>
			<Button type="ghost" @click="close" v-else>关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import selectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import arrangeRecord from './arrange-record.vue'
	import leaveRecord from './leave-record.vue'
	import LeaveWarn from './leave-warn.vue'
	export default{
		mixins: [modal],
		components: {
			leaveRecord,
			LeaveWarn,
			arrangeRecord,
			selectStudent,
			dateRangePicker
		},
		data () {
			return {
				sid: 0,
				name: '',
				tab: 'leave'
			}
		},
		methods: {
			ok () {
				this.$refs['ref_leave'].ok()
			},
			sidChange(sid){
				
				this.sid = sid
			},
			tabChange(tab){
				console.log('tab:'+tab)
				this.tab = tab
			}
		}
	}
</script>

<style>
</style>