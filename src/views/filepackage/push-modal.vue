<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="推送对象">
				<RadioGroup v-model="push_type" type="button">
			        <Radio label="cid">班级</Radio>
			        <Radio label="sid">学员</Radio>
			    </RadioGroup>
				
			</Form-item>
			<Form-item label="选择班级" v-if="push_type=='cid'">
				<select-class v-model="info.cid"></select-class>
			</Form-item>
			<Form-item label="选择学员" v-else>			
				<select-student v-model="info.sid"></select-student>
			</Form-item>
			<Form-item label="备注">
				<Input v-model="info.title" placeholder="请输入" :autosize="{minRows:4,maxRows:4}"></Input>
			</Form-item>
		</Form>		
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	export default{
		mixins: [ common, modal ],
		components: {
			SelectClass,
			SelectStudent
		},
		data () {
			return {
				push_type: 'cid',
				fileIds: [],
				info: {
					cid: 0,
					sid: 0,
					title: '',
					is_push: 1,	
					file_package_file: [],
				}
			}
		},
		watch: {
			'push_type': function (val) {
				if(val=='cid'){
					this.info.sid = 0
				}else{
					this.info.cid = 0
				}
			}
		},
		computed: {
			file_package_file () {
				let result = []
				if(this.fileIds&&this.fileIds.length>0){
					this.fileIds.forEach(f=>{
						result.push({file_id:f})
					})
				}
				return result
			}
		},
		methods: {
			ok () {
				if(this.push_type == 'cid' && this.info.cid==0){					
					this.$Message.error('请选择推送班级')
					return false					
				}
				if(this.push_type =='sid' && this.info.sid==0){
					this.$Message.error('请选择推送学员')
					return false
				}
				this.info.file_package_file = this.file_package_file
				
				this.$rest('file_packages')
				.post(this.info)
				.success(data=>{
					this.$Message.success('发送成功！')	
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