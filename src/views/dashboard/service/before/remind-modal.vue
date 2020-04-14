<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="900">
		<remind-list :height="500" :ca-id="caId" @on-success="emitSuccess"></remind-list>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import RemindList from '@/views/service/bclass/remind.vue'
	export default {
		mixins: [modal],
		props: {
			caId: {
				type: Number,
				default: 0
			}
		},
		components: {
			RemindList
		},
		data() {
			return {

			}
		},
		methods: {
			emitSuccess() {
				this.$emit('on-success')
			}
		}
	}
</script>