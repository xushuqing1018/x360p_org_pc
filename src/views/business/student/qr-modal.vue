<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="680">
		<div class="text-center">
			<Alert>请用学员的联系人手机扫描下面二维码，或者将二维码转发给学员的微信</Alert>
			<img :src="uri">
		</div>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'	
	export default{
		mixins: [modal],
		data () {
			return {
				uri: ''
			}
		},
		methods: {
			
		}
	}
	
</script>

<style>
</style>