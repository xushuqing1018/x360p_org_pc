<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<template v-if="modal$.show">
			<Form ref="form" :model="info" :label-width="80">
				<Form-item label="标题" prop="title">
					<Input v-model="info.title" clearable placeholder="请输入"></Input>
				</Form-item>
                <Form-item label="备注说明" prop="desc">
					<Input v-model="info.desc" type="textarea" placeholder="请输入" :autosize="{minRows:3,maxRows:3}"></Input>
				</Form-item>
                <Form-item label="调查问卷">
					<select-questionnaire v-model="info.questionnaire_bind.qid" clearable></select-questionnaire>
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
    
    import SelectQuestionnaire from 'c%/SelectQuestionnaire.vue'

	const emptyObj = {
        as_id:0,
		title: '',
        desc: '',
        questionnaire_bind:{
			qid:0,
			bind_table:'appointment'
        }
	}
	export default {
        mixins: [modal,common],
        components:{
            SelectQuestionnaire
        },
		data() {
			return {
				info: util.copy(emptyObj)
			}
		},
		methods: {
			ok() {
                if(this.info.title == '') {
					this.$Message.error('请填写标题')
					return
				}
                
                let [uri,method,msg] = this.modal$.action=='add'?['appointment_subjects','post','保存成功']:['appointment_subjects/'+this.info.as_id,'put','修改成功']
				
				this.$rest(uri)[method](this.info)
				.success(response=>{
                    this.$Message.success(msg)
                    this.$emit('on-success')
                    this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
			}
		}
	}
</script>