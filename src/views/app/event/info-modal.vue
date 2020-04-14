<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="800" :mask-closable="false">
		
		<RadioGroup v-model="tab" type="button" size="small" class="mb-3">
			<Radio label="basic">基础</Radio>
			<Radio label="content">活动内容</Radio>
			<Radio label="file">活动附件</Radio>
			<Radio label="share">分享设置</Radio>
		</RadioGroup>
		<Form :label-width="100" label-position="right" ref="form" :model="info" :rules="rules" v-if="modal$.show">		
				<div v-show="tab=='basic'">			
					<Row>
						<Col span="12">
							<Form-item label="活动范围" prop="scope">
								<RadioGroup v-model="info.scope" type="button">
									<Radio :label="item" v-for="(item,index) in scope_list" :key="index">
							            <span>{{map_scope_list[item]}}</span>
							        </Radio>
								</RadioGroup>
							</Form-item>
						</Col>
						<Col span="12">
							<Form-item label="选择班级" prop="cids" v-if="info.scope=='class'">
								<select-class v-model="info.cids" clearable></select-class>
							</Form-item>
                            <Form-item label="选择年级" prop="grades" v-if="info.scope=='grade'">
                                <Select multiple v-model="info.grades">
                                    <Option v-for="(item,index) in dicts('grade')" :key="index" :value="item.name">{{item.title}}</Option>
                                </Select>
							</Form-item>
							<Form-item label="选择校区" prop="bids" v-if="info.scope=='branch'">
								<select-branch v-model="info.bids" clearable></select-branch>
							</Form-item>
						</Col>
					</Row>
					<Form-item label="活动名称" prop="event_name">
						<Input v-model="info.event_name" placeholder="请输入活动名称" style="width:320px"></Input>
					</Form-item>
					<Form-item label="活动封面" prop="event_image_url">
						<div class="img-upload img-upload-full">
							<div class="img-thumb" style="width:375px !important;height:150px;line-height: 150px;">
								<Icon type="camera" size="30" v-if="info.event_image_url == ''" style="line-height: inherit;"></Icon>
								<img :src="info.event_image_url" @click="picturePreview(info.event_image_url)" v-else>
							</div>
							<p>图片大小建议(600px*300px)</p>
						</div>
						<c-upload
							v-model="info.event_image_url"
							btn-text="上传"
						>
						</c-upload>
					</Form-item>	
					<Row>
						<Col span="12">
							<Form-item label="活动类型" prop="event_type_did">
								<Select v-model="info.event_type_did">
									<Option v-for="item in dicts('event_type')" :value="item.did" :key="item.did" :disabled="disabledEventType(item)">{{item.title}}</Option>
								</Select>
							</Form-item>
						</Col>
						<Col span="6">
							<Form-item label="是否允许报名">
								<i-switch v-model="info.allow_sign_up" :true-value="1" :false-value="0">
									<span slot="open">是</span>
									<span slot="close">否</span>
								</i-switch>
							</Form-item>
						</Col>
						<Col span="6">
							<Form-item label="最大报名数" v-if="info.allow_sign_up && info.event_type_did != 185">
								<Input-number v-model="info.apply_nums_limit">
									 <span slot="append">人</span>
								</Input-number>
							</Form-item>
						</Col>
					</Row>

					<Row v-if="info.allow_sign_up && info.event_type_did == 185">
						<Col span="12">
							<Form-item label="主题交流人数" prop="thematic_exchange_nums">
								<Input-number v-model="info.thematic_exchange_nums">
									 <span slot="append">人</span>
								</Input-number>
							</Form-item>
						</Col>
						<Col span="12">							
							<Form-item label="旁听人数" prop="observer_nums">
								<Input-number v-model="info.observer_nums">
									 <span slot="append">人</span>
								</Input-number>
							</Form-item>
						</Col>
					</Row>

                    <Row v-if="info.allow_sign_up">
						<Col span="12">
                            <Form-item label="活动开始前" prop="attend_before_minute">
                                <Input-number v-model="info.attend_before_minute" :min="0"></Input-number>
                                <span>分钟可进行签到</span>
                            </Form-item>
						</Col>
                        <Col span="12">
                            <Form-item label="活动开始后" prop="attend_before_minute">
                                <Input-number v-model="info.unattend_before_minute" :min="0"></Input-number>
                                <span>分钟不可签到（0不限制）</span>
                            </Form-item>
						</Col>
					</Row>
					
					<Row>
						<Col span="12">
							<Form-item label="开始时间" prop="event_start_time">
								<DatePicker transfer editable placeholder="开始时间" type="date" format="yyyy-MM-dd" :options="optionsStartTime" v-model="info.event_start_time" style="width:180px;"></DatePicker>
                                <TimePicker
                                    v-model="info.strat_hour"
                                    format="HH:mm"
                                    :disabled-hours="optionsStartTimeHours"
                                    :disabled-minutes="optionsStartTimeMinutes"
                                    placeholder="时间"
                                    style="width:100px;">
                                </TimePicker>
							</Form-item>
						</Col>
                        <Col span="12">							
							<Form-item label="结束时间" prop="event_end_time">
								<DatePicker transfer editable placeholder="结束时间" type="date" format="yyyy-MM-dd" :options="optionsEndTime" v-model="info.event_end_time" style="width:180px;"></DatePicker>
                                <TimePicker
                                    v-model="info.end_hour"
                                    format="HH:mm"
                                    :disabled-hours="optionsEndTimeHours"
                                    :disabled-minutes="optionsEndTimeMinutes"
                                    placeholder="时间"
                                    style="width:100px;">
                                </TimePicker>
							</Form-item>
						</Col>
					</Row>
					
					<Row>
						<Col span="12">
							<Form-item label="活动链接">
								<Input v-model="info.link_url" placeholder="请输入活动链接"></Input>
							</Form-item>
						</Col>
						<Col span="12">
							<Form-item label="是否线上活动">
								<i-switch v-model="info.is_event_online">
							        <Icon type="android-done" slot="open" :value="true"></Icon>
							        <Icon type="android-close" slot="close" :value="false"></Icon>
							    </i-switch>
							</Form-item>
						</Col>
					</Row>

					<Row>
						<Col span="12">
							<Form-item label="活动地址">
								<Input v-model="info.address" type="textarea" placeholder="请输入活动地址" :autosize="{minRows:3,maxRows:3}"></Input>
							</Form-item>
						</Col>
                        <Col span="12">
							<Form-item label="调查问卷">
								<select-questionnaire v-model="info.questionnaire_bind.qid" clearable></select-questionnaire>
							</Form-item>
						</Col>
					</Row>
				</div>		
				<div v-show="tab=='content'">					
					<umeditor ref="ueditor" :config="{autoHeightEnabled:false,initialFrameHeight:500}" v-model="info.event_content" ></umeditor>					
				</div>
				<div v-show="tab=='file'">					
					<review-upload ref="upload" v-model="info.event_attachment"></review-upload>				
				</div>
				<div v-show="tab=='share'">
					<Form-item label="分享图片" prop="share_image_url">
						<div class="img-upload">
							<div class="img-thumb">
					            <Icon type="camera" size="30" v-if="info.share_image_url == ''" style="line-height: inherit;"></Icon>
					            <img :src="info.share_image_url" @click="picturePreview(info.share_image_url)" v-else>
					        </div>	
					        <p>(300px*300px)微信朋友圈显示图片</p>
				        </div>
						<c-upload
							v-model="info.share_image_url"
							btn-text="上传"
						>
						</c-upload>
					</Form-item>	
					<Form-item label="分享标题" prop="share_title">
						<Input v-model="info.share_title" placeholder="请输入分享标题"></Input>
					</Form-item>
				</div>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
    import moment from 'moment'
	
	import Umeditor from 'c%/UmEditor'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import cUpload from 'c%/cUpload.vue'
	import reviewUpload from 'c%/reviewUpload.vue'
	import SelectQuestionnaire from 'c%/SelectQuestionnaire.vue'
	
	const emptyObject = {
        bid:0,
		cids: [],
        bids: [],
        grades:[],
		event_name: '',
		is_event_online: false,
		scope: 'global',
		event_type_did: 0,					
		event_start_time: '',
		event_end_time: '',
		share_title: '',
		share_image_url: '',
		event_image_url:'',
		event_content: '',
		link_url: '',
		apply_nums_limit: 0,
		status: 1,
		allow_sign_up: 1,
		thematic_exchange_nums:0,
		observer_nums:0,
		event_attachment:[],
		questionnaire_bind:{
			qid:0,
			bind_table:'event'
        },
        address:'',
        attend_before_minute:30,
        unattend_before_minute:30,
        strat_hour:'',
        end_hour:'',
	}
	
	export default{
		mixins: [ modal, common ],
		components: {
			cUpload,
			SelectClass,
			SelectBranch,
			Umeditor,
			DateRangePicker,
			reviewUpload,
			SelectQuestionnaire
		},
		data () {
			return {
				tab: 'basic',
				upload_percent1: 0,
				upload_percent2: 0,
				info: util.copy(emptyObject),
				scope_list: ['class','grade','branch','global'],
				map_scope_list: {'class':'班级','grade':'年级','branch':'校区','global':'全局'},
				rules: {
					event_name: [
						{ required: true, message: '请输入活动名称', trigger: 'blur' }
					],				
					event_start_time: [
						{ required: true, type: 'date', message: '请选择活动开始时间', trigger: 'change' }
					],
					event_end_time: [
						{ required: true, type: 'date', message: '请选择活动结束时间', trigger: 'change' }
					],
					event_type_did: [
						{ required: true, type: 'number', message: '请选择活动类型', trigger: 'change' }
					]
				},
				questionnaire_data:[]
			}
		},
		watch: {
            'modal$.show': function (val){
                if(val&&this.modal$.action == 'add'){
                    this.info.event_start_time = moment().format('YYYY-MM-DD')
				}
            },
			'info.scope': function (val) {
				if(val=='class'){
                    this.info.bids = []
                    this.info.grades = []
					this.info.event_type_did = 181
				}else if(val=='branch'){
                    this.info.cids = []
                    this.info.grades = []
				}else if(val=='grade'){
                    this.info.cids = []
                    this.info.bids = []
				}else{
                    this.info.cids = []
                    this.info.grades = []
					this.info.bids = [this.bid$]
				}
			},
			'info.event_type_did': function (val) {
				if(val == 181){
					this.info.scope = 'class'
				}
			}
		},
		computed: {
            optionsStartTime(){
				return {
					disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000
                    }
				}
            },
            optionsStartTimeHours(){
                let ret = []
                
                if(this.modal$.action == 'edit'){
                    return ret
                }
                
                let hours = moment().get('hours')
                let now = moment().format('YYYY-MM-DD')
                let event_start_time = moment(this.info.event_start_time).format('YYYY-MM-DD')

                if(moment(now).isSame(moment(event_start_time))){
                    let date = event_start_time + ' ' + this.info.strat_hour
                    let now_time = new moment().format('YYYY-MM-DD HH:mm')
                    let hours2 = moment(date).get('hours')

                    if(moment(date).isBefore(now_time) && hours != hours2){
                        let minutes = moment().get('minutes')
                        this.info.strat_hour = hours + ':' + minutes
                    }

                    for(var i = 0;i < 24;i ++){
                        if(i < hours){
                            ret.push(i)
                        }
                    }
                }

                return ret
            },
            optionsStartTimeMinutes(){
                let ret = []

                if(this.modal$.action == 'edit'){
                    return ret
                }

                let minutes = moment().get('minutes')
                let hours = moment().get('hours')
                let hours2 = 0
                let minutes2 = 0
                let strat_hour = this.info.strat_hour

                if(strat_hour != ''){
                    hours2 = this.jsleft(strat_hour,2)
                    minutes2 = this.jsright(strat_hour,2)
                }

                let now = moment().format('YYYY-MM-DD')
                let event_start_time = moment(this.info.event_start_time).format('YYYY-MM-DD')

                if(moment(now).isSame(moment(event_start_time)) && hours2 == hours){
                    if(minutes2 <= minutes){
                        this.info.strat_hour = hours2 + ':' + minutes
                    }
                    for(var i = 0;i < 60;i ++){
                        if(i <= minutes){
                            ret.push(i)
                        }
                    }
                }
                
                return ret
            },
			optionsEndTime () {
                let start_date = new Date(this.info.event_start_time).getTime()
				return {
					disabledDate (date) {
                        return date && date.valueOf() < start_date;
                    }
				}
            },
            optionsEndTimeHours(){
                let ret = []
                let event_start_time = this.info.event_start_time
                let event_end_time = this.info.event_end_time
                let strat_hour = this.info.strat_hour

                if(moment(event_start_time).isSame(moment(event_end_time)) && strat_hour != ''){
                    let minutes = parseInt(this.jsright(strat_hour,2))
                    let hours = parseInt(this.jsleft(strat_hour,2))
                    let hours2 = parseInt(this.jsleft(this.info.end_hour,2))

                    for(var i = 0;i < 24;i ++){
                        if(i < hours){
                            ret.push(i)
                        }
                    }

                    if(hours2 < hours){
                        this.info.end_hour = hours + ':' + (minutes + 1)
                    }
                }

                return ret
            },
            optionsEndTimeMinutes(){
                let ret = []
                let event_start_time = this.info.event_start_time
                let event_end_time = this.info.event_end_time
                let strat_hour = this.info.strat_hour
                let end_hour = this.info.end_hour

                if(moment(event_start_time).isSame(moment(event_end_time)) && strat_hour != ''){
                    let hours = parseInt(this.jsleft(strat_hour,2))
                    let hours2 = parseInt(this.jsleft(end_hour,2))

                    if(hours == hours2){
                        let minutes = parseInt(this.jsright(strat_hour,2))
                        let minutes2 = parseInt(this.jsright(end_hour,2))
                        for(var i = 0;i < 60;i ++){
                            if(i <= minutes){
                                ret.push(i)
                            }
                        }

                        if(minutes2 < minutes){
                            this.info.end_hour = hours2 + ':' + (minutes + 1)
                        }
                    }
                }

                return ret
            }
		},
		mounted(){
            this.get_questionnaire_data()
		},
		methods: {
			get_questionnaire_data(){
				this.$rest('questionnaires?mode=1')
				.get()
				.success(res => {
					this.questionnaire_data = res.list
				})
				.error(res => {
					this.$Message.error('获取调查问卷失败')
				})
			},
			disabledEventType (item) {
				if(item.did==181){
					return this.info.scope!=='class'					
				}else{
					return this.info.scope=='class'
				}
			},
			ok () {
                if(this.info.event_name == ''){
                    this.$Message.error('请输入活动名称')
					return 
                }
				if(this.info.scope=='class'&&this.info.cids.length ==0){
					this.$Message.error('请选择活动班级')
					return 
                }
                if(this.info.scope=='grade'&&this.info.grades.length==0){
					this.$Message.error('请选择年级')
					return 
				}
				if(this.info.scope=='branch'&&this.info.bids.length==0){
					this.$Message.error('请选择活动校区')
					return 
                }
                if(this.info.event_type_did == 0){
                    this.$Message.error('请选择活动类型')
					return 
                }
                if(this.info.event_start_time == '' || this.info.strat_hour == '' || this.info.event_end_time == '' || this.info.end_hour == ''){
                    this.$Message.error('活动时间填写不完整')
					return 
                }

                this.info.event_start_time = moment(this.info.event_start_time).format('YYYY-MM-DD') + ' ' + this.info.strat_hour
                this.info.event_end_time = moment(this.info.event_end_time).format('YYYY-MM-DD') + ' ' + this.info.end_hour
                if(moment(this.info.event_end_time).isBefore(this.info.event_start_time)){
                    this.$Message.error('活动结束时间不能小于开始时间')
					return 
                }

				if(this.info.event_type_did == 185){
					this.info.apply_nums_limit = this.info.thematic_exchange_nums + this.info.observer_nums 
				}
				if(this.info.questionnaire_bind.qid == 0){
					delete this.info.questionnaire_bind
                }
                
                this.info.bid = this.bid$
				
				let [uri,method,msg] = this.modal$.action=='add'?['events','post','添加成功']:['events/'+this.info.event_id,'put','修改成功']
				
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'添加失败~')
				})
			}
		}
		
	}
</script>
