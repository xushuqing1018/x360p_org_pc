<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<template v-if="modal$.show">
			<Form ref="form" :model="info" :label-width="80">
				<Form-item label="条目标题" prop="title">
					<Input v-model="info.title" clearable style="width: 300px;" placeholder="请输入"></Input>
				</Form-item>
                <Form-item label="问题类型" prop="stype">
					<RadioGroup type="button" v-model="info.stype">
						<Radio :label="0">单选</Radio>
						<Radio :label="1">多选</Radio>
                        <Radio :label="2">单行文本</Radio>
						<Radio :label="3">多行文本</Radio>
					</RadioGroup>
				</Form-item>
				<Form-item label="选项" prop="questionnaire_subject_choice" v-if="info.stype == 0 || info.stype == 1">
					<div class="questionnaire-item-wrapper">
						<table class="modal-table">
	            			<thead>
	            				<tr>
	            					<th width="100"><div class="ivu-table-cell">内容类型</div></th>
	            					<th width="200"><div class="ivu-table-cell">内容</div></th>
									<th width="80px"><div class="ivu-table-cell">操作</div></th>
	            				</tr>
	            			</thead>
	            			<tbody>
	            				<tr v-for="(item,index) in info.questionnaire_subject_choice" :key="index">
	            					<td>
                                        <Select v-model="item.content_type">
											<Option :value="0">文本</Option>
											<Option :value="1">图片地址</Option>
											<Option :value="2">HTML</Option>
										</Select>
                                    </td>
	            					<td><div class="ivu-table-cell"><Input v-model="item.content" placeholder="请输入"></Input></div></td>
									<td>
	                    				<div class="ivu-table-cell">
											<Button type="text" icon="ios-trash" @click="deleteChoice(item,index)"></Button>
	                    				</div>
	                    			</td>
	            				</tr>
	            				<tr>
	            					<td colspan="3" class="text-center"><i class="ivu-icon ivu-icon-plus" style="cursor: pointer;" @click="add_choice">&nbsp;添加选项</i></td>
	            				</tr>
	            			</tbody>
	            		</table>
					</div>
				</Form-item>
			</Form> 
		</template>
		<div slot="footer">
			<Button type="ghost" @click="cancle">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'

	const emptyObj = {
		title: '',
		stype: 0,
		questionnaire_subject_choice: [],
		bid: 0
	}
	export default {
		mixins: [modal,common],
		data() {
			return {
				info: util.copy(emptyObj),
				questionnaire: {},
				action: '',
                new_choice: '',
                content_type: 0
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					if(this.modal$.action == 'add') {
						this.info = util.copy(emptyObj)
						this.action = 'add'
                        this.info.bid = this.questionnaire.bid
                        this.info.qid = this.questionnaire.qid
					}else{
                        this.action = ''
					}
				}
			}
		},
		methods: {
			deleteChoice(item,index) {
                if (item.qsc_id == 0) {
					this.info.questionnaire_subject_choice.splice(index,1)
				}else{
					this.$Modal.confirm({
						content: `确认要删除该选项吗？`,
						onOk: ()=> {
							this.$http.delete('questionnanire_subjects/' + item.qsc_id + '/choice')
							.then(res => {
                                this.$Message.success('删除成功');
                                this.info.questionnaire_subject_choice.splice(index,1)
							},res => {
								this.error(res.body.message);
							})
						}
					})
				}
			},
			add_choice (){
                let item = {
					qsc_id:0,
					qs_id:this.info.qs_id,
					content:'',
					content_type:0
				}
                this.info.questionnaire_subject_choice.push(item)
            },
			ok() {
                if(this.info.title == '') {
					this.$Message.error('请填写条目标题')
					return
				}
				if(this.info.stype == 0 || this.info.stype == 1){
					if(this.info.questionnaire_subject_choice.length == 0) {
						this.$Message.error('请添加选项')
						return
					}
					try {
						this.info.questionnaire_subject_choice.forEach(data=>{
                	    	if(/^\s*$/.test(data.content)){
                	    	    throw new Error("请输入选项内容");
							}
                		})
					} catch (e) {
						this.$Message.error(e.message)
						return
					}
				}
				this.save()
			},
			save() {
                let [uri,method,msg] = this.modal$.action=='add'?['questionnanire_subjects','post','保存成功']:['questionnanire_subjects/'+this.info.qs_id,'put','修改成功']
				
				this.$rest(uri)[method](this.info)
				.success(response=>{
                    this.$Message.success(msg)
                    this.$emit('save')
                    this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
			},
			cancle(){
				this.$emit('save')
				this.close()
			}
		},
		computed: {
	        qt() {
	        	let ques = []
	        	if(this.questionnaire.qt_dids && this.questionnaire.qt_dids.length>0) {
	        		this.questionnaire.qt_dids.forEach(item => {
		        		let qobj = this.dicts('questionnaire_type').find(q => q.did == item)
		        		if(qobj) {
		        			ques.push(qobj)
		        		}
		        	})
	        	}
	        	return ques
	        }
		}
	}
</script>
<style lang="less">
	
</style>