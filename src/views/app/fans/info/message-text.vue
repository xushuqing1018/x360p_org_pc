<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="680">
		<Input v-model="info.content.text" type="textarea" :autosize="{minRows: 6,maxRows: 6}" placeholder="请输入..." v-if="type=='text'"></Input>
		<Form :label-width="80" v-else>
			<Form-item label="内容">
				<Input v-model="template.content.data.first" placeholder="请输入消息内容"></Input>
			</Form-item>
			<Form-item label="待办主题">
				<Input v-model="template.content.data.keyword1" placeholder="请输入待办主题"></Input>
			</Form-item>
			<Form-item label="待办内容">
				<Input v-model="template.content.data.keyword2" placeholder="待办内容"></Input>
			</Form-item>
			<!--<Form-item label="日期">
				<Input v-model="template.content.data.keyword3" placeholder="待办内容"></Input>
			</Form-item>-->
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">发送</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	
	const emptyObject = {
		type: 'text',
		content:{text:''}		
	}
	
	const emptyTemplate = {
		type: 'template',
		content:{
			data: {
				first: '',
				keyword1: '消息提醒',
				keyword2: '你有新的消息',
				keyword3: moment(new Date()).format('YYYY-MM-DD')
			}
		}
	}
	
	export default{
		mixins: [ modal ],
		data () {
			return {
				type: '',
				info: util.copy(emptyObject),
				template: util.copy(emptyTemplate)
			}
		},
		props: {
			expired: {
				type: Boolean,
				default: ()=>{
					return false
				}
			}			
		},
		watch: {
			'modal$.show': function (val) {		
				this.info = util.copy(emptyObject)
				this.template = util.copy(emptyTemplate)			
			}
		},
		methods: {
			ok () {
				let params = this.info				
				if(this.type=='template'){
					params = this.template
				}else{
					if(/^\s*$/.test(this.info.content.text)){
						this.$Message.error('请输入消息内容')
						return 
					}
				}
				
				this.$rest('wxmp_fans/'+this.$route.params.id+'/messages').post(params)
				.success(data=>{
					this.$Message.success('发送成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'发送失败')
				})
			}
		}
	}
	
</script>

<style>
</style>