<template>
  <Modal v-drag-modal :mask-closable="false" width="750" v-model="modal$.show" :title="modal$.title">
    <Form :label-width="80" :model="growup_item" ref="form">
      <Form-item label="标题"> 
				<Input placeholder="请输入标题" v-model="growup_item.title" /> 
			</Form-item>
      <Form-item label="入学前"> 
				<Input v-model="growup_item.before_content" />
        <review-upload class="mt-3" ref="upload" :showCourseFile="showCourseFile" v-model="before_uploadList">
		    </review-upload>
			</Form-item>
      <Form-item label="入学后"> 
				<Input v-model="growup_item.after_content" />
        <review-upload class="mt-3" ref="upload" :showCourseFile="showCourseFile" v-model="after_uploadList">
		    </review-upload>
			</Form-item>
    </Form>
    <div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="save()">提交</Button>
		</div>
  </Modal>
</template>

<script>
  import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
  import common from '@/libs/common.mixin'
	import reviewUpload from 'c%/reviewUpload.vue'
	import grid from '@/libs/grid.mixin'

  const emptyObject = {		
		title: '',
		before_content: '',
		after_content: '',
		edu_growup_pic: []
	}

  export default {
    name: 'edugrowupAddModal',
    mixins: [globals,grid,common,modal],
    components: {
      reviewUpload,
    },
    data () {
      return {
        showCourseFile: false,
				growup_item: util.copy(emptyObject),
				before_uploadList: [],
				after_uploadList: [],
				item: {},
				egi_id: 0,		
      }
		},
		watch: {
			"modal$.show": function (val) {
				this.modal_show(val)
			}
		},
    methods: {
			imgType (url) {
				let index = url.lastIndexOf('.')
				return url.slice(index+1)
			},
			mediaType (url) {
				let form = this.imgType(url)
				let img_type = 'IMAGE,JPG,PNG,JPEG,GIF,image,jpg,jpeg,png,gif,bmp'
				let voice_type = 'video,rm,rmvb,mpeg1－4,mov,mtv,dat,wmv,avi,3gp,amv,dmv,flv,mp4'
				if(img_type.indexOf(form) > -1){
					return "image"
				}
				if(voice_type.indexOf(form) > -1){
					return "video"
				}
			},
			modal_show (val) {
				if(val){
					if(this.modal$.action	==	'edit') {
						this.growup_item = util.copy(this.item)
						this.egi_id = this.growup_item.egi_id
						this.growup_item.edu_growup_pic.forEach(u=>{
							if(u.position == "before"){
								this.before_uploadList.push({
									file_url: u.url,
									file_type: this.imgType(u.url),
									media_type: this.mediaType(u.url)
								})
							} else {
								this.after_uploadList.push({
									file_url: u.url,
									file_type: this.imgType(u.url),
									media_type: this.mediaType(u.url)
								})
							}
						})
					}
				}
			},
			save(){
				if(this.growup_item.title == ""){
					this.$Message.info("标题不能为空")
					return false 
				}
				if(this.growup_item.before_content == ""){
					this.$Message.info("成长对比之前内容不能为空")
					return false 
				}
				if(this.growup_item.after_content == ""){
					this.$Message.info("成长对比之后内容不能为空")
					return false 
				}
				if(this.before_uploadList.length == 0){
					this.$Message.info("图片(音视频)内容不能为空")
					return false 
				}
				if(this.after_uploadList.length == 0){
					this.$Message.info("图片(音视频)内容不能为空")
					return false 
				}
				this.growup_item.edu_growup_pic = []
				this.before_uploadList.forEach(u=>{
					if(typeof this.growup_item.edu_growup_pic.find(a=>a.url===u.url)==='undefined') {
							this.growup_item.edu_growup_pic.push({
								url: u.file_url,
								position: "before"
							})	
						}					
					})
				this.after_uploadList.forEach(u=>{
					if(typeof this.growup_item.edu_growup_pic.find(a=>a.url===u.url)==='undefined') {
							this.growup_item.edu_growup_pic.push({
								url: u.file_url,
								position: "after"
							})	
						}					
					})
	      let method = this.modal$.action == 'add'?'post':'put'
				let action = this.modal$.action == 'add'?'添加':'编辑'
				let $rest = this.$rest("edu_growups")
	      if(this.modal$.action != 'add') {
						$rest  = this.$rest("edu_growup_items")
	      	} else {
						$rest.add_url_param(this.$route.params.id,'items')
					}
	      $rest[method](this.growup_item)
	        .success(response=>{
	          let data = response.data
	          this.$Message.success(util.sprintf('%s成功!',action))
	          this.$emit('on-success')
	          this.close()
	      	})
	        .error(response=>{
	          this.error(response.body.message)
	        })
      	},
    }
  }
</script>

<style scoped>

</style>