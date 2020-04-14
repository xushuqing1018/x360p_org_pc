<template>
	<Modal :title="modal$.title" v-drag-modal v-model="modal$.show" :mask-closable="false" width="850">
		<div class="image-editor" v-if="modal$.show">
			<Row>
           		<Col span="24">
					<Card>			               
		                <Row :gutter="10">
		                    <Col span="14" class="image-editor-con1">
		                        <div class="cropper">
		                            <img id="cropimg" alt="">
		                        </div>
		                    </Col>
		                    <Col span="10" class="image-editor-con1">
		                        <Row type="flex" justify="center" align="middle" class="image-editor-con1-preview-con">
		                            <div id="preview1"></div>
		                        </Row>
		                        <div class="image-editor-con1-btn-con margin-top-10">
		                            <input type="file" accept="image/png, image/jpeg, image/gif, image/jpg" @change="handleChange" id="fileinput1" class="fileinput" />
		                            <label class="filelabel" for="fileinput1"><Icon type="image"></Icon>&nbsp;选择图片</label>
		                            <span><Button @click="handlecrop" type="primary" icon="crop">裁剪</Button></span>		                            
		                        </div>			                        
		                    </Col>
		                </Row>
		            </Card>
	            </Col>
			</Row>
        </div>
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import Cropper from 'cropperjs'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default{
		mixins: [modal,common],
		data () {
			return {
				sid: 0,
				uri: '/api/upload',
				method: 'post',
				cropper: {},
				post: { 
	        		sid: 0,
	        		_name: '',
	        		mod: 'student_avatar',
	        		_b64file: ''
	        	},
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					setTimeout(()=>{
						let img = document.getElementById('cropimg');
				
						this.cropper = new Cropper(img, {
				            dragMode: 'move',
				            preview: '#preview1',
				            aspectRatio: 1/1,
				            restore: false,
				            center: false,
				            highlight: false,
				            cropBoxMovable: false,
				            toggleDragModeOnDblclick: false
				        })
					},10)					
				}
			}
		},
		methods: {
			handleChange (e) {
	            let file = e.target.files[0];	     
	            this.post._name = file.name.substring(0,file.name.lastIndexOf('.'))
	            let reader = new FileReader();
	            reader.onload = () => {
	                this.cropper.replace(reader.result)
	                this.post._b64file = reader.result //this.cropper.getCroppedCanvas().toDataURL()
	                reader.onload = null	                
	            };
	            reader.readAsDataURL(file)	   
	        },
	        handlecrop () {
	            this.post._b64file = this.cropper.getCroppedCanvas().toDataURL()
	            this.picturePreview(this.post._b64file)
	        },
	        ok () {	        	
	        	this.post.sid = this.sid
	        	this.$rest(this.uri)[this.method](this.post)
	        	.success(data=>{
	        		this.$Message.success('更换头像成功')
	        		this.$emit('on-save-success',data)	        		
	        		this.close()
	        	}).error(response=>{
	        		this.error(response.body.message||'操作失败')
	        	})
	        }
		},
		computed: {
			
		}
	}
</script>