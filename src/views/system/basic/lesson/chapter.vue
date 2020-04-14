<template>
	<div>
		<Modal width="900" :mask-closable="false" v-model="modal_show" title="章节管理" @on-ok="close_modal" @on-cancel="close_modal">				
			<Spin fix v-if="upload_prograss">
				<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            	<div>正在上传文件...</div>
			</Spin>        	
			<table class="modal-table">
        		<thead>
        			<th style="width:80px"><div class="ivu-table-cell">序号</div></th>
        			<th style="width:160px"><div class="ivu-table-cell">章节标题</div></th>
        			<th style="width:80px"><div class="ivu-table-cell">是否有作业</div></th>
        			<th style="width:180px"><div class="ivu-table-cell">操作</div></th>
        		</thead>
        		<tr v-for="(item,index) in chapters">
        			<td>
        				<div class="ivu-table-cell"> 					
        					<span>{{item.chapter_index}}</span>
        				</div>
        			</td>
        			<td>
        				<div class="ivu-table-cell">
        					<Input v-model="item.title" v-if="item.isedit"></Input>
        					<h6 v-else>{{item.title}}</h6><br />
        				</div>
        			</td>
        			<td>
        				<div class="ivu-table-cell">
        					{{item.has_homework}}
        				</div>
        			</td>
        			<td>
        				<div class="ivu-table-cell">
        					<Button type="primary" size="small" v-if="item.isedit" @click="edit_chapter(index,false)">确定</Button>
        					<Button type="primary" size="small" v-else @click="edit_chapter(index,true)">编辑</Button>
        					<Button type="error" size="small" @click="del_chapter(index)">删除</Button>
        				</div>
        			</td>
        		</tr>
        		<tr v-show="show_add_btn">
        			<td colspan="3">
        				<div class="ivu-table-cell" style="text-align: center;">
        					<Button type="primary" @click="show_modal_add">添加章节</Button>
        				</div>
        			</td>
        		</tr>
        	</table>        	
        </Modal>
        <Modal :mask-closable="false" v-model="modal_chapter_add" title="添加章节" @on-ok="add_chapter" @on-cancel="modal_chapter_add = false;chapter.title = ''">
        	<Form :label-width="80">
        		<Form-item label="章节序号">
        			<Input v-model="chapter.chapter_index" placeholder="请输入章节序号"></Input>
        		</Form-item>
        		<Form-item label="章节名称">
        			<Input v-model="chapter.title" placeholder="请输入章节名称"></Input>
        		</Form-item>
        		<Form-item label="章节时长">
        			<Input v-model="chapter.lesson_hours" placeholder="请输入章节时长"></Input>
        		</Form-item>
        	</Form>
        </Modal>    
	</div>
</template>

<script>
	import Vue from 'vue'
	import common from '@/libx/common.mixin'
	export default{		
		mixins: [common],
		data () {
			return {
				modal_show: false,
				modal_chapter_add: false,				
				upload_prograss: false,				
				attachment: {
					lid: 0,
					lc_id: 0,
					chapter_index: 0,
					la_type: 0,
					title: ''
				},
				chapter: {
					chapter_index: 1,
					title: '',
					lesson_hours: 0
				},
			}
		},
		props:['modal_showHide','chapters','lesson_config','data','lesson_id'],
		methods: {
			show_modal_add () {
				this.modal_chapter_add = true
				this.chapter.chapter_index = this.chapters[this.chapters.length - 1].chapter_index + 1				
				this.chapter.lesson_hours = this.data.find(item=>item.lid === this.lesson_id).unit_hours				
			},
			//添加章节
			add_chapter () {
				this.$http.post('lessons/' + this.lesson_id + '/chapters',this.chapter)
				.then(response=>{
					let chapter = response.body.data
					Object.assign(chapter,{isedit: false},{chapter_attachment: []})
					this.chapters.push(chapter)
					this.chapters.sort((a, b) => a.chapter_index > b.chapter_index ? 1 : -1)
					this.$Message.success('添加成功')
				},response=>{
					this.error(response.body.message)
				})
			},
			//编辑章节
			edit_chapter (index,bool) {
				let chapter = this.chapters[index]
				Vue.set(chapter,'isedit',bool)
				if(!bool){
					let params = {title: chapter.title}
					this.$http.put('lessons/' + this.lesson_id + '/chapters/' + chapter.lc_id, params)
					.then(response=>{
						this.$Message.success('修改成功')
					},response=>{
						this.error(response.body.message)
					})
				}
			},
			//删除章节
			del_chapter (index){
				let chapter = this.chapters[index]
				this.$Modal.confirm({
                    content:'您确定要删除章节【'+chapter.title+'】吗?',
                    onOk:()=>{
                        this.$http.delete('lessons/' + this.lesson_id + '/chapters/' + chapter.lc_id)
						.then(response=>{
							this.$Message.success('删除成功!')
							this.chapters.splice(index,1)
						},response=>{
							this.error(response.body.message)
						})
                    }
                })
			},
			close_modal () {
				this.$emit('close_modals')
			}
		},
		computed: {
			show_add_btn () {
				let lesson = this.data.find(item=>item.lid === this.lesson_id)
				if(typeof lesson !== 'undefined'){
					if(this.chapters.length === lesson.chapter_nums){
						return false
					}
				}
				return true
			},
			upload_header(){
                return {
                    'x-token':this.$store.state.user.token,
                    'x-file-key':'file'
                }
            },
            upload_post(){
                return {
                    mod:'attachment_file'
                }
            },
		},
		watch: {
			modal_showHide(newValue) {
				this.modal_show = newValue
			}
		}
	}
</script>

<style>
</style>