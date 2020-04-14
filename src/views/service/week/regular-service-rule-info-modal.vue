<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="600" :mask-closable="false">
		<Form v-if="modal$.show" :model="info" :label-width="100" ref="form">
            <Form-item label="服务规则名称" class="mb-2">
				<Input type="text" v-model="info.rule_name" placeholder="请输入服务规则名称"></Input>
			</Form-item>
			<Form-item label="服务对象" class="mb-2">
				<RadioGroup v-model="info.teach_object_type" type="button" @on-change="onTypeChange">
                    <Radio label="0">
                        <span>班级</span>
                    </Radio>
                    <Radio label="1">
                        <span>个人</span>
                    </Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="服务类型" class="mb-2">
				<template>
					<Select v-model="info.st_did" clearable>
						<Option	:value="0">请选择</Option>
						<Option :value="item.did" v-for="(item,index) in (info.teach_object_type==0 ? class_service_type : student_service_type)" :key="index">{{item.title}}</Option>
					</Select>
				</template>
			</Form-item>
            <Form-item label="课次定义" class="mb-2" v-help="'哪几次课需要做，多次用逗号分隔'">
				<Input v-model="info.lesson_time_no" placeholder="请输入课次,多次用逗号分隔"></Input>
			</Form-item>
            <Form-item label="由谁做" class="mb-2">
				<Select v-model="info.rids" multiple placeholder="请选择角色">
					<Option :value="item.rid" v-for="(item,index) in roles" :key="index">{{item.role_name}}</Option>
				</Select>
			</Form-item>
			<Form-item label="服务标准" class="mb-2">
				<Input type="textarea" v-model="info.remark" placeholder="请输入服务标准" :autosize="{minRows: 3,maxRows: 4}"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving" >确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [ common, modal, globals ],
		props: {
			sid: {
				type: [Number,String],
				default: 0
			},
		},
		data () {
			return {
                info:{
                    rsr_id:0,
                    rule_name:'',
                    lesson_time_no:'',
                    rids:[],
		            teach_object_type: "0",
		            st_did: 0,
		            remark: ''
                }
			}
        },
        computed:{
			student_service_type(){
				return this.dicts('student_service_type')
			},
			class_service_type(){
				return this.dicts('class_service_type')
			}
		},
		methods: {	
            onTypeChange() {
				this.info.st_did = 0
			},
			ok () {
                if (this.info.rule_name == '') {
                    this.$Message.error('请输入服务规则名称')
                    return
                }

                if (this.info.st_did == 0) {
                    this.$Message.error('请选择服务类型')
                    return
                }

                if (!/^[1-9][0-9]*(,[1-9][0-9]*)*$/.test(this.info.lesson_time_no)) {
                    this.$Message.error('课次输入格式不正确，必须是数字，多个数字用逗号分隔')
                    return
                }

                if (this.info.rids.length == 0) {
                    this.$Message.error('请选择完成角色')
                    return
                }

                let [uri,method] = this.modal$.action=='add'?['regular_service_rules','post']:['regular_service_rules/'+this.info.rsr_id,'put']
                
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success('保存成功！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'保存失败~')
				})
			}
		}
	}
</script>

<style>
</style>