<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<template v-if="modal$.show">
			<Form ref="form" :model="info" :label-width="80" :rules="rules">
				<Form-item label="条目标题" prop="title">
					<Input v-model="info.title" clearable style="width: 300px;" placeholder="请输入"></Input>
				</Form-item>
				<Form-item label="条目类型" prop="qt_did">
					<Select v-model="info.qt_did" clearable style="width: 300px;">
						<Option v-for="item in qt" :value="item.did.toString()">{{item.title}}</Option>
					</Select>
				</Form-item>
				<Form-item label="单(多)选" prop="is_multi">
					<RadioGroup type="button" v-model="info.is_multi">
						<Radio :label="0">单选</Radio>
						<Radio :label="1">多选</Radio>
					</RadioGroup>
				</Form-item>
				<Form-item label="选项" prop="choices">
					<div class="questionnaire-item-wrapper">
						<div class="choice-wrap" v-for="(item,index) in info.choices">
							<Input 
								v-model="info.choices[index]" 
								style="width: 50%;margin-bottom: .4rem" 
								v-if="action=='edit'">
							</Input>
							<template v-else>
								<span>{{item}}</span>
								<Poptip
									confirm 
									title="确定删除吗？"
									@on-ok="deleteChoice(index)">
									<Icon type="minus-circled" color="#ed3f14"></Icon>
								</Poptip>
							</template>
						</div>
						<div class="add-wrap" v-if="action=='add'">
							<Input 
								v-model="new_choice" 
								style="width: 50%"
								placeholder="请输入选项">
							</Input>
							<Button
								type="text" 
	 							size="small" 
	 							@click="addConfirm"
	 							v-if="action=='add'">保存
							</Button>
						</div>
						<div class="btn-wrap">
							<Button 
								type="text" 
								size="small" 
								@click="editChoice"
								v-if="action==''&&info.choices.length>0">编辑所有
							</Button>
 							<Button 
	 							type="text" 
	 							size="small" 
	 							@click="addChoice"
	 							v-if="action==''">添加一个
 							</Button>
 							<Button 
	 							type="text" 
	 							size="small" 
	 							@click="editConfirm"
	 							v-if="action=='edit'">保存所有
 							</Button>
						</div>
					</div>
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
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'

	const INFO_NAME  = '问卷条目'
	const INFO_PK_ID = 'qi_id'
	const INFO_URL   = 'questionnaires/%s/questionnaire_item'

	const emptyObj = {
		title: '',
		is_multi: 0,
		qt_did: '',
		choices: [],
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
				rules: {
					title: [
						{ required: true, message: '请输入条目标题', trigger: 'blur' }
					],
					qt_did: [
						{ required: true, message: '请选择条目类型', trigger: 'change' }
					]			
				}
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					if(this.modal$.action == 'add') {
						this.info = util.copy(emptyObj)
						this.action = 'add'
						this.$nextTick(() => {
							if(this.qt.length>0) {
								this.info.qt_did = this.qt[0].did.toString()
							}
						})
						this.info.bid = this.questionnaire.bid
					}else{
						this.action = ''
					}
				}
			}
		},
		methods: {
			editChoice() {
				this.action = 'edit'
			},
			addChoice() {
				this.action = 'add'
			},
			deleteChoice(index) {
				this.info.choices.splice(index,1)
			},
			editConfirm() {
				this.action = ''
			},
			addConfirm() {
				if(this.action == 'add'&&this.new_choice !== '') {
					this.info.choices.push(this.new_choice)
					this.new_choice = ''
				}
				this.action = ''
			},
			ok() {
				if(this.info.choices.length==0) {
					this.$Message.error('问卷条目选项不能为空')
					return false
				}
				this.save()
			},
			save() {
				let method = this.modal$.action == 'add'?'post':'put'
                let action = this.modal$.action == 'add'?'添加':'编辑'
                let $rest  = this.$rest(this.info_url$)
                if(this.modal$.action != 'add'){
                    $rest.add_url_param(this.info[this.info_pk_id$])
                }else{
                    if(this.info && this.info_pk_id$ && this.info[this.info_pk_id$]){
                        delete this.info[this.info_pk_id$]
                    }
                }
                $rest[method](this.info)
                .success(response=>{
                    let data = response.data
                    
                    if(this.modal$.action == 'add' && _.isString(data) && /^\d+$/.test(data)){
                        this.info[this.info_pk_id$] = util.int(data)
                    }
                    this.$Message.success(util.sprintf('%s%s成功!',this.info_name$,action))
                    this.$emit('save',{action:this.modal$.action,data:this.info})
                    this.close()
                })
			}
		},
		computed: {
			info_url$(){
            	return this.modal$.action == 'add' ? 
            	util.sprintf(INFO_URL,this.questionnaire.qid) : 'questionnaire_items'
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        },
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