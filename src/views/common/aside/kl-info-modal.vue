<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="800">
		<template v-if="modal$.show">
			<Form ref="form" :label-width="80" :model="info" :rules="rules">
				<Alert show-icon>请到相关的页面创建关联的知识点，页面切换时会自动搜索</Alert>
				<Form-item label="知识标题" prop="title">
					<Input v-model="info.title" clearable placeholder="请输入知识标题"></Input>
				</Form-item>
				<Form-item label="知识类型" prop="ktype_did">
					<Select v-model="info.ktype_did" placeholder="请选择知识类型">
						<Option 
							:value="item.did" 
							v-for="item in dicts('knowlege_type')" 
							:key="item.did">{{item.title}}
						</Option>
					</Select>
				</Form-item>
				<Form-item label="关键词">
					<Tag 
						type="border"
						closable 
						@on-close="closeKeyword(index)" 
						v-for="(item,index) in info.keywords">{{item}}
					</Tag>
					<Input 
						ref="key"
						v-model="keyword" 
						placeholder="输入后请回车确认" 
						style="width: 20%;" 
						@on-enter="saveKeyword"
						@on-blur="checkSave">
					</Input>
				</Form-item>
				<Form-item label="内容" prop="content">
					<mavon-editor v-model="info.content" :toolbars="mavon_config"></mavon-editor>
				</Form-item>
				<review-upload v-model="info.knowledge_item_file" style="margin-left: 80px;"></review-upload>
			</Form>
			<div slot="footer">
				<Button type="ghost" @click="close">关闭</Button>
				<Button type="primary" @click="save">确定</Button>
			</div>
		</template>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import { mavonEditor } from 'mavon-editor'
	import ReviewUpload from 'c%/ReviewUpload.vue'

	const INFO_NAME = '知识点'
	const INFO_PK_ID = 'ki_id'
	const INFO_URL   = 'knowledge_items'

	const emptyObject = {
		title: '',
		ktype_did: '',
		keywords: [],
		content: '',
		router_uri: '',
		bid:0,
		knowledge_item_file: []
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			mavonEditor,
			ReviewUpload
		},
		data() {
			return {
				info: util.copy(emptyObject),
				keyword: '',
				rules: {
					title: [
						{ required: true, type:'string', message:'请输入知识标题', trigger: 'blur' }
					],
					ktype_did: [
						{ required: true, type:'number', message:'请选择知识类型', trigger: 'change' }
					],
					keywords: [
						{ required: true, type:'string', message:'请输入关键词', trigger: 'blur' }
					],
					content: [
						{ required: true, type:'string', message:'请输入知识内容', trigger: 'blur' }
					]
				}
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val&&this.modal$.action=='add') {
					this.info = util.copy(emptyObject)
					this.info.router_uri = this.$route.path
					this.info.bid = this.bid$
				}
			}
		},
		methods: {
			closeKeyword(index) {
				this.info.keywords.splice(index,1)
			},
			saveKeyword() {
				if(this.keyword!=='') {
					this.info.keywords.push(this.keyword)
					this.keyword = ''
					this.$refs.key.focus()
				}
			},
			checkSave() {
				if(this.keyword!=='') {
					this.$Message.info('关键词请按回车键确认')
					this.$refs.key.focus()
				}
			}
		},
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        },
	        mavon_config() {
	        	return {
	        		bold: true, // 粗体
			      	italic: true, // 斜体
			      	header: true, // 标题
			      	underline: true, // 下划线
			      	strikethrough: true, // 中划线
			      	mark: true, // 标记
			      	superscript: true, // 上角标
			      	subscript: true, // 下角标
			      	quote: true, // 引用
			      	link: true, // 链接
			      	fullscreen: true, // 全屏编辑
			      	readmodel: true, // 沉浸式阅读
			      	alignleft: true, // 左对齐
			      	aligncenter: true, // 居中
			      	alignright: true, // 右对齐
			      	subfield: true, // 单双栏模式
			      	preview: true, // 预览
		      	}
	        }
		}
	}
</script>