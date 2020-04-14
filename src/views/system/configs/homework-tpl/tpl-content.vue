<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="650" :mask-closable="false">		
		<template>
			<Form label-position="left">
				<Row>
					<Col span="14">
						<Form-item label="模板名称" :label-width="80" class="mr-4 mb-2">
							<Input placeholder="模板名称" v-model="info.name"  style="width: 200px"></Input>
						</Form-item>
					</Col>
				</Row>
			</Form>
			<Form label-position="top">		
				<Form-item label="模板内容" label-position="top" class="mb-2">
					<ueditor 
		        		class="ueditor" 
		        		ref="ueditor" 
                        v-model="info.setting.content" 
		        		:ueditor-config="ueconfig">
	        		</ueditor>	
				</Form-item>	
			</Form>
			<Form>
				<Form-item>
					<review-upload v-model="info.setting.attachements" ref="upload">
						模板附件
					</review-upload>
				</Form-item>
			</Form>
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import Ueditor from 'c%/Ueditor'
	import ReviewUpload from 'c%/ReviewUpload.vue'
	
	const emptyObject = {
        name: '',
        setting:{content : '',attachements : []}
	}
	
	export default{
		mixins: [ modal,common,globals ],
		components: {
			Ueditor,
			ReviewUpload,
		},
		data () {
			return {
				info: util.copy(emptyObject),
				htts_id: 0
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					if(this.modal$.action=='add'){
						this.info = util.copy(emptyObject)
					}else{
						this.initInfo()	
					}
				}
			}
		},		
		methods: {
			initInfo () {
				let htts_id = this.htts_id
				if(htts_id){
					this.$rest('homework_task_tpl_settings/'+htts_id).get()
					.success(data=>{
						this.info = data
						this.info.setting = JSON.parse(this.info.setting)
					})
				}
			},
			ok () {
				let [method,uri,message] = this.modal$.action=='add'?['post','homework_task_tpl_settings','添加成功']:['put','homework_task_tpl_settings/'+this.info.htts_id,'修改成功']
				
				if(/^\s*$/.test(this.info.name)){
					this.$Message.error('请输入模板名称')
					return
				}
				if(/^\s*$/.test(this.info.setting.content)){
					this.$Message.error('请输入模板内容')
					return
				}

				this.info.setting = JSON.stringify(this.info.setting)

				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success(message)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'保存失败！')
				})
			},
		},
		computed: {	
			ueconfig(){
	            return {
	                toolbars: [
	                    [
	                    'link', 
	                    'inserttable',
	                    'spechars', 
	                    'justifyleft', 
	                    'justifyright', 
	                    'justifycenter', 
	                    'justifyjustify', 
	                    'undo', 
	                    'redo', 
	                    'bold']
	                ],
	                elementPathEnabled: false,
	                wordCount: false,           
	                initialFrameHeight: 300,
	                initialFrameWidth: 620,
	                enableAutoSave: false,
	                autoHeightEnabled: true,
	                zIndex: 2999,
	            }
	        }
		}
	}
</script>

<style>
</style>