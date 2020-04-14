<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		<Form :label-width="80" :model="info" ref="form" v-if="modal$.show">
			<Form-item label="学员" prop="sid">
				<span v-if="modal$.action=='view'">{{info.student?info.student.student_name:'-'}}</span>
				<select-student v-else-if="modal$.action=='edit'" v-model="info.sid" clearable></select-student>
				<select-student v-else v-model="info.sids" clearable></select-student>
			</Form-item>
			<Form-item label="作品名称">
				<span v-if="modal$.action=='view'">{{info.art_name}}</span>
				<Input v-model="info.art_name" placeholder="请输入作品名称" v-else></Input>
			</Form-item>
			<Form-item :label="label_teacher">
				<span v-if="modal$.action=='view'">{{info.eid|ename}}</span>
				<select-employee v-model="info.eid" clearable v-else></select-employee>
			</Form-item>
			<Form-item label="作品介绍">
				<span v-if="modal$.action=='view'">{{info.art_desc}}</span>
				<Input type="textarea" v-model="info.art_desc" :autosize="{minRows:4,maxRows:4}" v-else></Input>
			</Form-item>
			<Form-item label="作品图片">
				<review-upload v-model="info.student_artwork_attachment" :mode="mode">
					<span></span>
				</review-upload>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<div class="pull-left">
				<Checkbox v-model="is_push">
					<span class="text-info">推送微信消息给学生家长</span>
				</Checkbox>
			</div>
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving" v-if="modal$.action!='view'">确定</Button>
		</div>
		
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import ReviewUpload from 'c%/ReviewUpload.vue'
		
	const emptyObject = {
		art_name: '',
		bid: 0,
		sids: [],
		eid: 0,
		art_desc: '',
		student_artwork_attachment: [],
		is_push: 0
	}
	
	export default{
		mixins: [ modal, globals, common ],
		components: {
			SelectStudent,
			SelectEmployee,
			ReviewUpload
		},
		data () {
			return {
				sart_id: 0,
				info: util.copy(emptyObject),
				is_push: true 
			}
		},
		watch: {
			
		},
		computed: {
			mode () {
				let result = this.modal$.action=='view'?'view':'add' 
				
				return result
			}
		},
		methods: {
			ok () {
				let [uri,method,msg] = this.modal$.action=='edit'?['student_artworks/'+this.info.sart_id,'put','修改成功！']:['student_artworks','post','添加成功！']
				
				if(this.check()){
					this.info.is_push = this.is_push
					this.info.bid = this.bid$
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'操作失败')
					})
				}
			},
			check () {
				let info = this.info
				
				if(this.modal$.action=='add') {
					if(info.sids.length==0){
						this.$Message.error('请选择学员')
						return false
					}
				}else if(this.modal$.action=='edit') {
					if(info.sid==0){
						this.$Message.error('请选择学员')
						return false
					}
				}
				if(/^\s*$/.test(info.art_name)){
					this.$Message.error('请输入作品名称')
					return false
				}
				if(info.eid==0){
					this.$Message.error('请选择指导'+this.$filter('translate')('老师'))
					return false
				}
				if(/^\s*$/.test(info.art_desc)){
					this.$Message.error('请输入作品介绍')
					return false
				}
				return true				
			},
			inifInfo () {
				this.$rest('student_artworks/'+this.sart_id)
				.get()
				.success(data=>{
					this.info = data
				}).error(response=>{
					this.$Message.error(response.body.message||'获取作品信息失败~')
				})
			}
		}
	}
</script>

<style>
</style>