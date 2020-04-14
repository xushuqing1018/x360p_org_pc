<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<template v-if="modal$.show">
			<Form ref="form" :model="info" :label-width="80" :rules="rules">
				<Form-item label="问卷标题" prop="name">
					<Input v-model="info.name" clearable style="width: 350px;" placeholder="请输入"></Input>
				</Form-item>
				<Form-item label="问卷类型" prop="qt_dids">
					<Select v-model="info.qt_dids" multiple style="width: 350px;">
						<Option v-for="(item,index) in qt" :value="item.did.toString()" :key="index">{{item.title}}</Option>
					</Select>
				</Form-item>
				<Form-item label="适用校区" prop="bid">
					<RadioGroup v-model="info.bid" type="button">
						<Radio :label="bid$">当前</Radio>
						<Radio :label="0">所有</Radio>
					</RadioGroup>
				</Form-item>
			</Form> 
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="save">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'

	const INFO_NAME  = '问卷'
	const INFO_PK_ID = 'qid'
	const INFO_URL   = 'questionnaires'

	export default {
		mixins: [modal,common],
		data() {
			return {
				info: {
					name: '',
					qt_dids: [],
					bid: 0,
					mode:1
				},
				rules: {
					name: [
						{ required: true, type: 'string', message: '请输入问卷标题', trigger: 'blur' }
					],
					qt_dids: [
						{ required: true, type: 'array', message: '请选择问卷类型', trigger: 'change'}
					]					
				}
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val&&this.modal$.action == 'add') {
					this.info.name = ''
					this.info.qt_dids.splice(0)
				}
			}
		},
		methods: {
			save() {
				this.$form('form').check()
				.then(res => {
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
				})
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
	        qt() {
	        	return this.dicts('questionnaire_type')
	        }
		}
	}
</script>