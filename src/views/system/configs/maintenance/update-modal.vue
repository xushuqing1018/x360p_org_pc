<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="450">
		<div class="maintenance-modal-content">
			<div class="msg" v-html="info.content"></div>
			<Icon type="happy" color="#19be6b" v-if="info.status" size="18"></Icon>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		props: {
			data: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		data() {
			return {
				info: {}
			}
		},
		methods: {
			excute () {
				this.$rest(this.info.url)
				.put()
				.success(res => {
					this.info.content += `<p>${res.data.msg}</p>`
					if(res.data.status == 0) {
						this.excute()
					}else{
						this.info.status = 1
						this.info.content += '<p>更新成功</p>'
					}
				})
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.info = util.copy(this.data)
					this.excute()
				}
			}
		}
	}
</script>
