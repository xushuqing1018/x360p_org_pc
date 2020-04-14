<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="900">
		<homework class="p-0"></homework>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import homework from '@/views/service/aclass/homework.vue'
	export default {
		mixins: [modal],
		components: {
			homework
		},
		data() {
			return {

			}
		},
		methods: {
			
		}
	}
</script>