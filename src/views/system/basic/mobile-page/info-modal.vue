<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		
		<template v-if="modal$.show">
			<Form :label-width="80" :rules="rules" ref="form" :model="info">
				<Form-item label="标题" prop="title">
					<Input v-model="info.title" placeholder="请输入标题" style="display: inline-block;width:400px"></Input>
					<Checkbox class="mb-0 ml-3" style="display: inline-block;" v-model="info.is_cate" :true-value="1" :false-value="0">是否分类</Checkbox>
				</Form-item>
				<Form-item label="缩略图" v-help="'微信分享朋友圈封面图'" prop="thumb_url">
					<div class="img-upload">
						<div class="img-thumb">
				            <Icon type="camera" size="30" v-if="info.thumb_url == ''" style="line-height: inherit;"></Icon>
				            <img :src="info.thumb_url" @click="picturePreview(info.thumb_url)" v-else>
				        </div>	
				        
			        </div>
					<c-upload
					v-model="info.thumb_url"
					btn-text="上传"
					>
					</c-upload>
				</Form-item>
				<Form-item label="内容" prop="content" v-if="info.is_cate==0">
					<umeditor v-model="info.content"></umeditor>
				</Form-item>
			</Form>
		</template>		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import Umeditor from 'c%/Umeditor.vue'
	import cUpload from 'c%/cUpload.vue'
	
	const emptyObject = {
		is_cate: 0,
		parent_pid: 0,
		thumb_url: '',
		title: '',
		content: ''		
	}
		
	export default{
		mixins: [ common,modal ],
		components: {
			cUpload,
			Umeditor
		},
		data () {
			return {
				parent_pid: 0,
				info: util.copy(emptyObject),
				rules: {
					title: [
						{ required: true, message: '请输入标题', trigger: 'blur' }
					]					
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(!val) {
					this.info = util.copy(emptyObject)
				}
			},
			parent_pid: function (val) {
				this.info.parent_pid = val
			}
		},
		methods:{
			ok () {
				this.$form('form').check().then(()=>{
					let [uri,method,msg] = this.modal$.action=='add'?['pages','post','添加成功！']:['pages/'+this.info.page_id,'put','修改成功！']
					
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'添加失败！')
					})
				})
			}
		}
	}
	
</script>
