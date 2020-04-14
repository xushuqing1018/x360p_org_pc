<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :width="650" :mask-closable="false">
		<Form :label-width="80" v-if="modal$.show" :model="info">
            <Form-item label="分类图标" class="mb-2 ivu-form-item-required">
				<div class="img-upload">
					<div class="img-thumb">
			            <Icon type="camera" size="30" v-if="info.icon_img == ''" style="line-height: inherit;"></Icon>
			            <img class="cursor" :src="info.icon_img" @click="picturePreview(info.icon_img)" v-else>
			        </div>	
			        <Progress :percent="upload_percent" :stroke-width="5" v-if="upload_percent > 0 && upload_percent < 100"></Progress>
			    </div>
				<c-upload 
				v-model="info.icon_img"
				@on-upload-start="handleUploadBefore"
				@on-uploading="handleUploadProgress"
					btn-text="上传">
				</c-upload>
			</Form-item>
			<Form-item label="分类名称" class="mb-2 ivu-form-item-required">
				<Input v-model="info.cate_name" placeholder="请输入分类名称"></Input>
			</Form-item>
            <Row>
				<Col span="12">
					<Form-item label="排序" class="mb-2 ivu-form-item-required">
				        <InputNumber v-model="info.sort" :step="1" :min="1"></InputNumber>
			        </Form-item>
				</Col>
                <Col span="12">
					<Form-item label="是否显示" class="mb-2 ivu-form-item-required">
			        	<RadioGroup v-model="info.is_show" type="button">
                            <Radio :label="1">
                                <span>是</span>
                            </Radio>
                            <Radio :label="0">
                                <span>否</span>
                            </Radio>
			        	</RadioGroup>
			        </Form-item>
				</Col>
			</Row>
            <Form-item label="描述" class="mb-2">
				<Input type="textarea" v-model="info.remark" :autosize="{minRows:2,maxRows:5}" placeholder="请输入描述"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import cUpload from 'c%/cUpload'
	
	const emptyObject = {
		pc_id:0,
		bid: 0,
		cate_name: '',
		sort: 1,
		icon_img: '',
		is_show: 1,
		remark: ''
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			cUpload
		},
		data () {
			return {
                info: util.copy(emptyObject),
                upload_percent: 0
			}
		},
		methods: {
			
			ok () {
				if(/$\s*^/.test(this.info.icon_img)){
					this.$Message.error('请上传分类图标')
					return
				}
				if(/$\s*^/.test(this.info.cate_name)){
					this.$Message.error('请输入分类名称')
					return
				}
				if(this.info.sort == null){
					this.$Message.error('请输入排序序号')
					return
                }
                
                this.info.bid = this.bid$
				
				let [uri,method] = this.modal$.action=='add'?['product_cates','post']:[`product_cates/${this.info.pc_id}`,'put']
				
				
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success('保存成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
			},
            handleUploadBefore(file){
            	this.upload_percent = 0
			},
            handleUploadError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });
            },
            handleUploadProgress(event,file,filelist){
            	this.upload_percent = event.percent
			},
		}
	}
	
</script>