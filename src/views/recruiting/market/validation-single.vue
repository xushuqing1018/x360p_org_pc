<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="480" :mask-closable="false">
		
		<Form :label-width="80">
			<Form-item label="有效性">
				<Alert show-icon v-if="info.cu_id>0">{{info.name}}已经转化为客户</Alert>
				<RadioGroup v-model="info.is_valid" type="button" v-else>
					<Radio :label="1">有效</Radio>
					<Radio :label="2">无效</Radio>
				</RadioGroup>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [ common, modal ],
		props: {
			token: {
				type: String,
				default: ''
			}
		},
		data () {
			return {
				info: {}
			}
		},
		methods: {
			ok () {
				if(this.info.is_valid == 0){
					this.$Notice.warning({
						title: '提示：',
						desc: '请选择有效性'
					})
					return
				}
				
				let params = util.copy(this.info)
				let [uri,method,msg] = ['market_clues/'+params.mcl_id,'put','修改成功！']
				
				params.bid = this.bid$
				if(this.token!=='') {
					params.token = this.token
				}
				this.$rest(uri)[method](params)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~','error')
				})
			}
		}
		
	}
</script>

<style>
</style>