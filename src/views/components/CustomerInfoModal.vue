<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800">
		
		<div class="row">
			<div class="col-md-3 text-center x-flex-center">
				<letter-avatar style="margin: 0;" rounded size="100" :name="info.name"></letter-avatar>
				<p class="mt-2 x-name text-center">{{info.name}}</p>
			</div>
			<div class="col-md-9">
				<Form :label-width="100" class="row">
					<Form-item label="性别：" class="col-md-6 mb-1">
						{{map_sex[info.sex]}}
					</Form-item>
					<Form-item label="责任人：" class="col-md-6 mb-1">
						{{info.follow_eid,'-'|ename}}
					</Form-item>
					<Form-item label="昵称：" class="col-md-6 mb-1">
						{{info.nick_name||'-'}}
					</Form-item>
					<Form-item label="意向程度：" class="col-md-6 mb-1">
						<Rate :value="info.intention_level" disabled></Rate>
					</Form-item>
					<Form-item label="生日：" class="col-md-6 mb-1">
						{{info.birth_time}}
						<Tag v-if="info.birth_time">{{age}}</Tag>
					</Form-item>
					<Form-item label="下次跟进时间：" class="col-md-6 mb-1">
						{{info.next_follow_time||'-'}}
					</Form-item>
					<Form-item label="介绍人：" class="col-md-6 mb-1">
						<span v-if="info.referer_sid > 0 && info.referer_student">{{info.referer_student.student_name}}</span>
						<span v-else>-</span>
					</Form-item>
					<Form-item label="最后跟进时间：" class="col-md-6 mb-1">
						{{info.last_follow_time||'-'}}
					</Form-item>
				</Form>
			</div>
		</div>
		<Card dis-hover>
			<p slot="title">
	            <Icon type="information-circled"></Icon> 基础信息
	        </p>
	        <Form :label-width="80" class="row">
	        	<Form-item label="校区：" class="col-md-4 mb-1">
	        		{{info.bid|branch_name}}
	        	</Form-item>
	        	<Form-item label="客户状态：" class="col-md-4 mb-1">
	        		{{labelDicts(info.customer_status_did,'customer_status')||'-'}}
	        	</Form-item>
	        	<Form-item label="招生来源：" class="col-md-4 mb-1">
	        		{{labelDicts(info.from_did,'from')||'-'}}
	        	</Form-item>
	        	<Form-item label="公立学校：" class="col-md-4 mb-0">
	        		{{info.school_id_text||'未填写'}}
	        	</Form-item>
	        	<Form-item label="就读年级：" class="col-md-4 mb-0">
	        		{{info.school_grade||'未填写'}}
	        	</Form-item>
	        	<Form-item label="就读班级：" class="col-md-4 mb-0">
	        		{{info.school_class||'未填写'}}
	        	</Form-item>
	        </Form>
		</Card>
		
		<Card dis-hover class="mt-3">
			<p slot="title">
				<Icon type="person" style="vertical-align: middle;" size="20"></Icon>
				联系人信息
			</p>
			<div class="row">
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">电话</div></th>
						<th><div class="ivu-table-cell">关系</div></th>
						<th><div class="ivu-table-cell">姓名</div></th>
					</thead>
					<tr>
						<td><div class="ivu-table-cell">{{info.first_tel}} -【第一联系人】</div></td>
						<td><div class="ivu-table-cell">{{info.first_family_rel|family_rel}}</div></td>
						<td><div class="ivu-table-cell">{{info.first_family_name||'-'}}</div></td>											
					</tr>
					<tr v-if="info.second_tel">
						<td><div class="ivu-table-cell">{{info.second_tel}} -【第二联系人】</div></td>
						<td><div class="ivu-table-cell">{{info.second_family_rel|family_rel}}</div></td>
						<td><div class="ivu-table-cell">{{info.second_family_name||'-'}}</div></td>											
					</tr>
				</table>
			</div>
		</Card>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'
	
	export default{
		mixins: [ common, modal, globals ],
		components: {
			LetterAvatar
		},
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		data () {
			return {
				map_sex: { 0: '未设置', 1: '男', 2: '女' }
			}
		},
		computed: {
			age() {
				return util.age(this.info.birth_time)
			},
		}
	}
	
</script>

<style lang="less" scoped>
.x-name{
	font-size: 18px;
}
.x-flex-center{
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}
</style>