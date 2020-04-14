<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-cloable="true" width="680">
		<Timeline>
	        <TimelineItem v-for="item in data">
	            <p class="time">{{item.create_time}}</p>
	            <p class="content">{{item.content}}</p>
	        </TimelineItem>
		</Timeline>		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	
	export default{
		mixins: [grid,modal],
		data () {
			return {
				rest_api: '',
				data: [],
				sid: 0,
			}
		},
		methods: {
			init () {
				this.rest_api = 'advices'
				this.init_data()
				return this
			},
			hook_get_param(params) {
				params.sid = this.sid
				params.bid = 0
			}
		}
	}
	
</script>

<style>
</style>