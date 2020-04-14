<style scoped>
	.class-type>.ivu-radio-wrapper {
		background-color: #EFF4F8;
		border: 0;
		border-radius: 0!important;
		height: 60px;
		line-height: 60px;
	}
	.ivu-radio-group-button .ivu-radio-wrapper-checked {
		box-shadow:	none;
	}
	.ivu-radio-group-button .ivu-radio-wrapper-checked.ivu-radio-focus:first-child {
		box-shadow:	none;	
	}
	.ivu-radio-group-button .ivu-radio-wrapper-checked:before {
		opacity: 0;
	}
	.ivu-radio-group-button.ivu-radio-group-large .ivu-radio-wrapper:after {
		height: 0;
	}
	.ivu-radio-group-button .ivu-radio-wrapper:after, .ivu-radio-group-button .ivu-radio-wrapper:before {
		transition: none;
		width: 0;
	}
	.ivu-radio-group-button .ivu-radio-wrapper-checked {
		border-bottom: 2px solid #39f;
	}
	.ivu-radio-group-button .ivu-radio-wrapper:hover {
		border-bottom: 2px solid #39f;
	}
</style>


<template>
<div class="c-grid">
	<div class="col-sm-12" style="margin-bottom: 10px;">
			<Button type="primary" icon="chevron-left" size="small" @click="back"></Button>
			<Button type="primary" icon="refresh" size="small" @click="refreshData"></Button>	
			<Button type="primary" icon="edit" size="small" @click="edit"></Button>
	</div>
	<Card dis-hover>
		<div slot="title">
			<Icon size="24" type="ios-person" style="vertical-align: middle;"></Icon>
			市场名单信息
		</div>
		<div class="row" style="align-items:center;justify-content:center;" v-if="data.customer">
			<div class="col-sm-4">
				<div style="align-items:center;justify-content:center;">								
					<div class="profile-wrap">
						<h3 class="text-center">
							{{data.customer.name}}										
							<span class="ml-3">{{data.customer.sex|sex}}</span>
						</h3>
						<Form :label-width="110">
							<Form-item label="生日" class="mb-0">
								{{data.customer.birth_year>0?data.customer.birth_time:'未设置'}}
								<Tag color="blue">{{age}}</Tag>
							</Form-item>
							<Form-item label="介绍人" class="mb-0">
								<Tag color="blue">{{data.customer.referer_sid>0?data.customer.referer_student.student_name:'无'}}</Tag>											
							</Form-item>
							<Form-item label="责任人" class="mb-0">
								<Tag color="blue">
									<template v-if="data.customer.follow_eid">{{data.customer.follow_eid|ename}}</template>
									<template v-else>无</template>
								</Tag>											
							</Form-item>
							<Form-item label="意向程度" class="mb-0">
								<Rate v-model="data.customer.intention_level" disabled></Rate>
							</Form-item>
							<Form-item label="下次跟进时间" class="mb-0">
									{{data.customer.next_follow_time||'-'}}											
							</Form-item>
							<Form-item label="最后跟进时间" class="mb-0">		
								{{data.customer.last_follow_time||'-'}}
							</Form-item>										
						</Form>									
					</div>
				</div>
			</div>
			<div class="col-sm-8" v-if="data.customer">
				<Card dis-hover>
					<div slot="title">
						<Icon type="information-circled" style="vertical-align: middle;" size="20"></Icon>
						基础信息
					</div>
					<div>
						<Form :label-width="120" class="row">
							<Form-item label="校区：" class="mb-0 col-sm-4">
								{{data.customer.bid|branch_name}}
							</Form-item>
							<Form-item label="客户状态：" class="mb-0 col-sm-4">
								{{labelDicts(data.customer.customer_status_did,'customer_status')||'-'}}
							</Form-item>
							<Form-item label="招生来源：" class="mb-0 col-sm-4">
								{{labelDicts(data.customer.from_did,'from')||'-'}}
							</Form-item>
							<Form-item label="公立学校：" class="mb-0 col-sm-4">
								{{data.customer.school_id_text||'未填写'}}
							</Form-item>
							<Form-item label="就读年级：" class="mb-0 col-sm-4">
								{{data.customer.school_grade||'未填写'}}
							</Form-item>
							<Form-item label="就读班级：" class="mb-0 col-sm-4">
								{{data.customer.school_class||'未填写'}}
							</Form-item>	
							<template v-for="(item, index) in option_fields" >
								<Form-item 
									:key="index"
									:label="item.label+'：'" 
									:class="['mb-0',item.type=='textarea'?'col-sm-12':'col-sm-4']">
									{{item.value}}
								</Form-item>
							</template>								
							<!-- <Form-item label="标签：" class="mb-0 col-sm-8">
								<Tag type="border" style="margin-right: 5px" :color="item.color" v-for="(item,index) in data.customer.tags" :key="index">{{item.tag_name}}</Tag>
								<Button type="ghost" icon="plus" size="small" @click="manageTag"></Button>
							</Form-item> -->
						</Form>
					</div>
				</Card>
				<Card dis-hover class="mt-3">
					<div slot="title">
						<Icon type="person" style="vertical-align: middle;" size="20"></Icon>
						联系人信息
					</div>
					<div class="row">
						<table class="modal-table">
							<thead>
								<th><div class="ivu-table-cell">电话</div></th>
								<th><div class="ivu-table-cell">关系</div></th>
								<th><div class="ivu-table-cell">姓名</div></th>
							</thead>
							<tr>
								<td><div class="ivu-table-cell">{{data.customer.first_tel}} -【第一联系人】</div></td>
								<td><div class="ivu-table-cell">{{data.customer.first_family_rel|family_rel}}</div></td>
								<td><div class="ivu-table-cell">{{data.first_family_name}}</div></td>											
							</tr>
							<tr v-if="data.second_tel">
								<td><div class="ivu-table-cell">{{data.customer.second_tel}} -【第二联系人】</div></td>
								<td><div class="ivu-table-cell">{{data.customer.second_family_rel|family_rel}}</div></td>
								<td><div class="ivu-table-cell">{{data.customer.second_family_name}}</div></td>											
							</tr>
						</table>
					</div>
				</Card>
			</div>
		</div>
	</Card>
		<div class="col-sm-12">
	  	<RadioGroup v-model="student_type" type="button" size="large" class="class-type">
    	    <Radio label="record_info">沟通记录</Radio>
    	    <Radio label="customer_files" v-if="is_customer">客户档案</Radio>
					<Radio label="student_files" v-if="is_customer">客户名单</Radio>
    	</RadioGroup>	
		</div>
		<div class="col-sm-12" v-if="student_type == 'record_info'" style="padding-left:0;padding-right:0;">
			<Follow-Record
			:cuId="$route.params.id"
			>
			</Follow-Record>
		</div>
		<div class="col-sm-12" v-if="student_type == 'customer_files'" style="padding-left:0;padding-right:0;">
			<Customer-Archive
			:cuId="data.customer.cu_id"
			>
			</Customer-Archive>
		</div>
		<div class="col-sm-12" v-if="student_type == 'student_files'" style="padding-left:0;padding-right:0;">
			<Student-Archive
			:cuId="data.customer.cu_id"
			>
			</Student-Archive>
		</div>
		<info-modal ref="info" @on-success="init_personal_data"></info-modal>
		</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import FollowRecord from './follow-record'
	import InfoModal 	from './info-modal.vue'
	import StudentArchive from '../list/student-archive'
	import CustomerArchive from './customer-archive'

	export default{
		mixins: [grid,globals,common,modal],
		components: {
			FollowRecord,
			InfoModal,
			CustomerArchive,
			StudentArchive
		},		
		data () {
			return {
				data: {
					customer:{}
				},
				student_type:	'record_info',
			}
		},
		mounted () {
			this.init_personal_data()
		},
		methods: {
			back () {
				this.$router.go(-1)
			},
			edit() {
				let title = util.sprintf('编辑名单【%s】', this.data.customer.name)		
				this.$refs.info
				.set('info', this.data.customer)	
				.show(title, 'edit')
			},
			refreshData () {
				this.init_personal_data()
			},
			init_personal_data () {
				let	uri = `market_clues/${this.$route.params.id}`
				this.$rest(uri).get()
				.success(data=>{	
					this.data.customer = data
				}).error(response=>{
					this.error(response.body.message)
				})				
			},
			manageTag() {
				this.$Modal.open('components/TagManageModal.vue@modal',{
					props: {
						type: 3,
						id: this.data.customer.mcl_id
					},
					on: {
						update: () => {
							this.$emit('update')
						}
					}
				})
				.then(modal => {
					modal.show(`【${this.data.customer.name}】标签管理`)
				})
			}
		},
		computed: {
			is_customer () {
				return this.data.customer.cu_id > 0
			},
			age() {
				return util.age(this.data.customer.birth_time)
			},
			option_fields(){
				let fields = []
				let fields_map = {}
				let option_fields = this.$store.state.gvars.configs.customer_option_fields
				let option_value  = this.data.option_fields
				let get_field_value = function(obj,f){
					if(obj && obj[f]){
						return obj[f]
					}
					return ''
				}
				option_fields.forEach(f=>{
					if(f.enable == 1){
						let field = {
							label:f.label,
							value:get_field_value(option_value,f.name),
							type:f.type
						}
						if(field.type !== 'textarea') {
							fields.unshift(field)
						}else{
							fields.push(field)
						}
					}
				})				
				return fields
			}
		}

	}
</script>
