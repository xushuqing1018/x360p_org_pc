<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="680" :mask-closable="false">
		<template v-if="modal$.show">
			<Form :label-width="80" :model="info" :rules="rules" ref="form">
				<template v-if="!viewMode">
				<FormItem label="课标归属">
					<RadioGroup v-model="type" type="button" size="small" @on-change="clearTypeData">
						<Radio label="lesson" :disabled="type=='textbook'&&viewMode">课程</Radio>
						<Radio label="textbook" :disabled="type=='lesson'&&viewMode">教材</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="归属课程" prop="lid" v-if="type=='lesson'">
					<select-lesson v-model="info.lid" :readonly="viewMode"></select-lesson>
				</FormItem>
				<FormItem label="归属教材" prop="tb_id" v-if="type=='textbook'">
					<select-textbook v-model="info.tb_id" :readonly="viewMode" @selected="selectTb"></select-textbook>
				</FormItem>
				<FormItem label="标题" prop="title">
					<Input v-model="info.title" placeholder="请输入标题" :readonly="viewMode"></Input>
				</FormItem>
				<FormItem label="课标类型" prop="csft_did">
					<Select v-model="info.csft_did" :disabled="viewMode">
						<Option :value="item.did" v-for="(item,index) in dicts('course_standard_file_type')" :key="index">{{item.title}}</Option>
					</Select>
				</FormItem>
				<Row>
					<Col span="10">
						<Form-item label="章节序号" prop="chapter_index" v-if="type=='lesson'">
							<InputNumber v-model="info.chapter_index" :min="1" :readonly="viewMode"></InputNumber>
						</Form-item>
						<Form-item label="章节" prop="tbs_id" v-if="type=='textbook'">
							<Select v-model="info.tbs_id" :disabled="viewMode">
								<Option :value="item.tbs_id" v-for="item in sectionData" :key="item.tbs_id">第{{item.sort}}章：{{item.section_title}}</Option>
							</Select>
						</Form-item>
					</Col>
					<Col span="7">
						<FormItem label="排序" prop="sort" v-help="'数值越小越靠前'">
							<InputNumber v-model="info.sort" :readonly="viewMode" :min="1"></InputNumber>
						</FormItem>
					</Col>
					<Col span="7">
						<FormItem label="课标状态" prop="enable">
							<i-switch size="large" :disabled="viewMode" v-model="info.enable" :true-value="1" :false-value="0">
								<span slot="open">启用</span>
								<span slot="close">禁用</span>
							</i-switch>
						</FormItem>
					</Col>
				</Row>
				</template>
				
				
				<FormItem label="课标附件">
					<template v-if="viewMode">
						<Alert type="warning" v-if="showForbidden" show-icon>
							禁止查看
							<template slot="desc">
							当前内容无查看权限.
							</template>
						</Alert>
						<file-item v-else :list="info.lesson_standard_file_item"></file-item>
					</template>
					<file-upload v-else 
					v-model="info.lesson_standard_file_item" 
					:show-course-file="false"
					:show-external="true"
					:showCourseCaseFile="true"
					>
						课标附件
					</file-upload>
				</FormItem>
			</Form>
				
		</template>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" v-if="!viewMode">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import FileUpload from 'c%/reviewUpload.vue'
	import FileItem from 'c%/FileItem.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectTextbook from 'c%/SelectTextbook.vue'

	const emptyObject = {
		lid: 0,
		tb_id: 0,
		sort: 1,
		enable: 1,
		title: '',
		csft_did: 0,
		lesson_standard_file_item: [],
		chapter_index: 1,
		tbs_id: 0,
		cc_id:0
	}
	
	export default{
		mixins: [ common,modal,globals ],
		components: {
			FileUpload,
			SelectLesson,
			SelectTextbook,
			FileItem
		},
		data () {
			return {
				sectionData: [],
				viewMode: false,
				info: util.copy(emptyObject),
				type: 'lesson',
				rules: {
					lid: [
						{ required: true, min: 1, type: 'number', message: '请选择课程', trigger:'change' } 
					],
					tb_id: [
						{ required: true, min: 1, type: 'number', message: '请选择教材', trigger:'change' } 
					],
					tbs_id: [
						{ required: true, min: 1, type: 'number', message: '请选择章节', trigger:'change' } 
					],
					title: [
						{ required: true, message: '请输入课标名称', trigger:'change' }
					],
					csft_did: [
						{ required: true, min: 1, type: 'number', message: '请选择课标类型', trigger:'change' }
					]
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(!val){
					this.info = util.copy(emptyObject);
				}
				else {
					if(this.modal$.action == 'edit') {
						this.initSection();
					}
				}
			},
			'info.lid': function() {
				this.info.chapter_index = 0
			},
			'info.tb_id': function() {
				if(this.modal$.action != 'edit') {
					this.info.tbs_id = 0
				}
			},
		},
		computed:{
			showForbidden(){
				if(this.info.forbidden){
					return true
				}
				if(this.is_orgs && !this.is_admin){
					return true
				}
				if(!this.is_orgs && this.rids_user.indexOf(3) === -1){
					return true
				}
				return false
			}
		},
		methods: {
			initSection() {
				this.$http.get('textbook_sections',{
					params: {
						tb_id: this.info.tb_id,
						pagesize:100
					}
				})
				.then(res => {
					var list = res.body.data.list;
					list.sort((a,b) => {
                        return a.sort - b.sort
                    })
					this.sectionData = list;
				},res => {
					this.$Message.error(res.body.message)
				})
			},
			selectTb() {
				this.$http.get('textbook_sections',{
					params: {
						tb_id: this.info.tb_id,
						pagesize:100
					}
				})
				.then(res => {
					var list = res.body.data.list;
					list.sort((a,b) => {
                        return a.sort - b.sort
                    })
					this.sectionData = list;
				},res => {
					this.$Message.error(res.body.message)
				})
			},
			clearTypeData() {
				this.info.lid = 0;
				this.info.tb_id = 0;
				this.info.tbs_id = 0
			},
			ok () {
				this.$form('form').check().then(()=>{
					let [uri,method,msg] = this.modal$.action=='add'?['lesson_standard_files','post','添加成功']:['lesson_standard_files/'+this.info.lsf_id,'put','编辑成功']
					
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

<style>
</style>