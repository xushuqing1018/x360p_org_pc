<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false" @on-cancel="cancel">
		<div v-if="modal$.show">
			<umeditor v-model="user.employee.profile.introduce" :config="{autoHeightEnabled:false,initialFrameHeight:500}"></umeditor>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="cancel" :loading="saving">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import umeditor from 'c%/Umeditor.vue'
	
	export default{
		mixins: [modal,common],
		components: {
			umeditor
		},
		data () {
			return {
				user:{}
			}
		},
		methods: {
			cancel () {
				this.close()
			},
			ok () {
				this.$emit('on-save',this.user, 'changeIntroduce',this.cancel())
			}
		}
	}
</script>

<style>
</style>