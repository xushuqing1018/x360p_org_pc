<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :width="700" :mask-closable="false">
		<Form ref="form" :model="info" :label-width="120">			
			<Form-item label="房间名称" prop="room_name" class="ivu-form-item-required">
				<Input v-model="info.room_name" placeholder="请输入名称"></Input>
			</Form-item>
			<Form-item label="所属老师" prop="eid" class="ivu-form-item-required">
				<select-employee v-model="info.eid" clearable></select-employee>
			</Form-item>
			<Form-item label="房间默认模式" prop="room_mode">
				<RadioGroup v-model="info.room_mode" type="button">
					<Radio :label="0">培训模式</Radio>
					<Radio :label="1">讨论模式</Radio>
					<Radio :label="2">视频模式</Radio>
				</RadioGroup>
			</Form-item>
			<Row>
				<Col span="12">
					<Form-item label="房间最大人数" prop="room_max_users">
						<InputNumber v-model="info.room_max_users"></InputNumber>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="允许游客进入" prop="visitor">
						<i-switch v-model="info.visitor" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="允许讨论模式" prop="discuss_flag">
						<i-switch v-model="info.discuss_flag" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="允许视频模式" prop="videos_flag">
						<i-switch v-model="info.videos_flag" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="允许自动上麦" prop="auto_mic">
						<i-switch v-model="info.auto_mic" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="允许单独查看文件" prop="dibbling">
						<i-switch v-model="info.dibbling" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="允许下载资料" prop="download_flag">
						<i-switch v-model="info.download_flag" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="允许保存聊天记录" prop="save_chat_flag">
						<i-switch v-model="info.save_chat_flag" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
				</Col>
			</Row>
			<Form-item label="视频流媒体地址" prop="rtmpt_video">
				<Input v-model="info.rtmpt_video" placeholder="请输入邮箱"></Input>
				<span style="color:#ccc">(默认为空,如果有多台服务器才考虑)</span>
			</Form-item>
			<Form-item label="hostID" prop="hostID">
				<Input v-model="info.hostID"></Input>
			</Form-item>
			<Form-item label="房间公告" prop="note">
				<Input type="textarea" v-model="info.note"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="text" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee' 

	const INFO_NAME = '房间'
	const INFO_PK_ID = 'lr_id'
	const INFO_URL   = 'live_rooms'

	const emptyObject = {
		room_name: '',
		eid: 0,
		room_max_users: 10,
		room_mode: 0,
		discuss_flag: 1,
		videos_flag: 1,
		auto_mic: 1,
		dibbling: 1,
		download_flag: 1,
		save_chat_flag: 1,
		visitor: 0,
		note: '',
		rtmpt_video: '',
		hostID: '',
	}
	
	export default{
		mixins: [common,modal],
		components: {
			SelectEmployee
		},
		data () {
			return {
				info: util.copy(emptyObject)
			}
		},
		methods: {
			ok() {
				if(this.info.room_name==='') {
					this.$Message.error('房间名称不能为空')
					return
				}
				if(this.info.eid==0) {
					this.$Message.error('请选择老师')
					return
				}
				this.save()
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
	        }
		}
	}
	
</script>