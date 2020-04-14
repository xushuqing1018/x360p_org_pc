<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="900">
		<course-prepare class="p-0"></course-prepare>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import CoursePrepare from '@/views/service/bclass/prepare.vue'
	export default {
		mixins: [modal],
		components: {
			CoursePrepare
		},
		data() {
			return {

			}
		},
		methods: {
			
		}
	}
</script>