<template>
	<!--在外层加v-if是为了保证每次弹出都在最上层的(而 不被其他modal所覆盖)-->
	<div v-if="modal$.show">
		<Modal v-drag-modal v-model="modal$.show" :title="modal$.title">
			<div class="text-center">
				<img :src="src" alt="" style="max-width:488px">				
			</div>
			
			<div slot="footer">
				<Button type="ghost" @click="close">关闭</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	
	export default{
		mixins: [modal],
		data () {
			return {
				imgSrc: ''
			}
		},
		computed: {
			src() {
				if(this.imgSrc.indexOf('xiao360.com') > -1) {
					return `${this.imgSrc}?imageView2/2/w/300`
				}
				return this.imgSrc
			}
		}
	}
	
</script>
