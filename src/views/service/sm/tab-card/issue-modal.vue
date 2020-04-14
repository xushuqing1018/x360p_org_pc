<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<Form :label-width="100" :model="info">
			<Form-item label="学员" class="ivu-form-item-required mb-2">
				<template v-if="users.length">
					<Tag v-for="item in users">{{item.student_name}}</Tag>
				</template>
				<select-student 
					v-model="sids" 
					@on-selected="selectStudent" 
					style="width: 250px;"
					v-else
					>
				</select-student>
			</Form-item>
			<Form-item label="会员卡" class="ivu-form-item-required mb-2">
				<Select 
					v-model="info.ct_id" 
					placeholder="请选择会员卡" 
					clearable 
					@on-change="selectCard"
					style="width: 250px;"
					>
					<Option :value="item.ct_id" v-for="item in cards">{{item.card_name}}</Option>
				</Select>
			</Form-item>
			<Form-item label="生效时间" prop="activate_begin_time" class="ivu-form-item-required mb-2">
				<DatePicker :value="info.activate_begin_time" @on-change="info.activate_begin_time=$event"></DatePicker>
			</Form-item>
			<Form-item label="过期时间" prop="activate_end_time" class="mb-2">
				<DatePicker 
					:value="info.activate_end_time" 
					@on-change="info.activate_end_time=$event"
					placeholder="请选择过期时间"
					>
				</DatePicker>
				(不填则不限制)
			</Form-item>
			<Form-item label="初始余额" prop="init_balance" class="mb-2">
				<InputNumber v-model="info.init_balance" :min="0"></InputNumber>
			</Form-item>
			<Form-item label="初始积分" prop="init_balance" class="mb-2">
				<InputNumber v-model="info.init_bonus" :min="0"></InputNumber>
			</Form-item>
			<Form-item label="初始等级" prop="init_level" class="ivu-form-item-required mb-2">
				<Select 
					v-model="info.init_level" 
					placeholder="请选择会员等级" 
					clearable
					style="width: 250px;"
					>
					<Option :value="index+1" v-for="(item,index) in levels">{{item.name}}</Option>
				</Select>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent'

	const emptyObject = {
		uids: [],
		ct_id: 0,
		activate_begin_time: '',
		activate_end_time: '',
		init_bonus:0,
		init_balance:0,
		init_level:1
	}
	export default {
		mixins: [modal,common,globals],
		components: {
			SelectStudent
		},
		props: {
			users: {
				type: Array,
				default:() => {
					return []
				}
			}
		},
		data() {
			return {
				sids: [],
				cards: [],
				levels: [],
				students: [],
				info: util.copy(emptyObject)
			}
		},
		mounted() {
			this.initInfo()
			this.initCards()
		},
		methods: {
			initInfo() {
				this.info.activate_begin_time = moment().format('YYYY-MM-DD')
				this.users.forEach(u => {
					this.info.uids.push({
						uid:u.first_uid,
						sid:u.sid
					})
				})
			},
			initCards() {
				this.$rest('card_types')
				.get({
					pagesize:1000
				})
				.success(res => {
					this.cards = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			selectCard(v) {
				let card = this.cards.find(c => c.ct_id == v)
				this.levels = card.card_define
			},
			selectStudent(selected) {
				selected.forEach(u => {
					this.info.uids.push({
						uid:u.first_uid,
						sid:u.sid
					})
				})
			},
			ok () {
				if(this.info.ct_id == 0){
					this.$Message.error('请选择会员卡')
					return
				}
				if(/$\s*^/.test(this.info.activate_begin_time)){
					this.$Message.error('请选择生效时间')
					return
				}
				if(this.info.init_level == 0){
					this.$Message.error('请选择会员等级')
					return
				}
				this.$rest('user_cards').add_url_param('batch_assign_card')
				.post(this.info)
				.success(data=>{
					this.$Message.success('发放成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
			}
		}
	}
</script>