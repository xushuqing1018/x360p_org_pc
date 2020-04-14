<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="800">
		<RadioGroup v-model="tab" type="button" v-if="sid>0">
	        <Radio label="info">{{modal$.action=='add'?'添加回访':'编辑回访'}}</Radio>
	        <Radio label="record">回访记录</Radio>
	    </RadioGroup>
	    <div class="mt-3">
		    <tab-info 
		    	ref="info" 
		    	v-show="tab=='info'" 
		    	:sid="sid" 
		    	:modal="modal$"
		    	@on-success="handlerSuccess" 
		    	>
	    	</tab-info>	    
		    <tab-record ref="record" v-if="tab=='record'" :sid="sid"></tab-record>
	    </div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>			
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import tabInfo from './tab-info.vue'
	import tabRecord from './tab-record.vue'
	
	export default{
		mixins: [modal],
		components: {
			tabInfo,
			tabRecord
		},
		props: {
			token: {
				type: String,
				default: ''
			}
		},
		data () {
			return {
				tab: 'info',
				sid: 0,
				info: {}
			}
		},		
		watch: {
			'modal$.show': function (val) {
				if(val){
					if(this.modal$.action=='edit') {
						this.$refs.info.info = this.info
					}
					this.$refs.info.info.sid = this.sid
				}
			}
		},
		methods: {
			handlerSuccess () {
				this.$emit('on-success')
				this.close()
			},
			ok () {
				this.$refs['info'].submit(this.token)
			}
		}
		
	}
</script>

<style>
</style>