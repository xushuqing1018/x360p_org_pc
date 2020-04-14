<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :width="500" :mask-closable="false">
		<Form ref="form" :model="config" :label-width="100">			
			<Form-item label="流媒体地址">
				<Input v-model="config.room_client_uri" placeholder="请输入名称"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="text" @click="close">关闭</Button>
			<Button type="primary" @click="handleSubmit" :loading="saving">保存</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import config from '@/libs/config.mixin'

	export default{
		mixins: [common,modal,config],
		data () {
			return {
				cfg_name:'app_live',
				config: {}
			}
		},
		methods: {
			submitFinished() {
				this.$store.dispatch('updateGlobalVar','configs')
				this.$emit('save')
				this.close()
			}
		}
	}
	
</script>