<template>
	<Modal v-model="modal$.show" :title="modal$.title" :width="880" :mask-closable="false" v-drag-modal>
		<div class="row">
			<div class="col-md-6 col-sm-12">
				<qrsign-setting :config="config" v-model="tab"></qrsign-setting>
			</div>
			
			<div class="col-md-6 col-sm-12">
				<qrsign-preview :config="config" :tab="tab"></qrsign-preview>
			</div>
		</div>
		
		<div slot="footer">
			<Button type="default" @click="resetqr">恢复为默认设置</Button>
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>		
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import QrsignSetting from 'v%/system/configs/qrsign/setting.vue'
	import QrsignPreview from 'v%/system/configs/qrsign/preview.vue'
	
	const emptyObject = {
		bid: 0,
		channel_name: '',
		qr_config: {}
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			QrsignSetting,
			QrsignPreview
		},
		data () {
			return {
				mc_id: 0,
				tab: '1',
				info: util.copy(emptyObject)
			}
		},
		computed: {
			config () {				
				if(_.isEmpty(this.info.qr_config)){
					this.info.qr_config = util.copy(this.$store.state.gvars.configs.qrsign)
				}
				return this.info.qr_config
			}
		},		
		methods: {
			ok () {
				let params = util.copy(this.info)
				params.bid = this.bid$
				
				let [uri,method,msg] = ['market_channels/'+params.mc_id,'put','修改成功！']
				
				this.$rest(uri)[method](params)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'添加失败~')
				})
			},
			resetqr(){
				let params = util.copy(this.info)
				params.qr_config = null
				params.bid = this.bid$
				
				let [uri,method,msg] = ['market_channels/'+params.mc_id,'put','恢复成功！']
				
				this.$rest(uri)[method](params)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'恢复失败~')
				})
			}
		}
	}
</script>

<style>
</style>