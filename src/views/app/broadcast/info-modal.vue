<template>
	<Modal v-drag-modal :mask-closable="false" width="900" v-model="modal$.show" :title="modal$.title">
		<Row :gutter="10" class="cast-info">
			<Col span="9">
				<Card dis-hover>
					<div slot="title">发送对象</div>
					<div>
						<RadioGroup v-model="info.type" type="button">
							<Badge :count="info.type==2?info.sids.length:0">
								<Radio :label="2">学员</Radio>
							</Badge>
							<Badge :count="info.type==1?employee.length:0">
								<Radio :label="1">员工</Radio>
							</Badge>
                            <Badge>
								<Radio :label="3">游客</Radio>
							</Badge>
						</RadioGroup>
					</div>
					<div class="select-condition">
						<template v-if="info.type==2">
							<Row type="flex" align="middle"> 
								<Col span="6">
									<Dropdown>
										<span class="add"><Icon type="plus"></Icon> 选学员</span>
										<DropdownMenu slot="list">
											<DropdownItem>
												<select-student v-model="info.sids" @on-selected="selectStudent">直接选学员</select-student>
											</DropdownItem>
											<DropdownItem>
												<select-class v-model="cid" @selected="selectClass">按班级选学员</select-class>
											</DropdownItem>
											<DropdownItem>
												<select-lesson v-model="lid" @selected="selectLesson">按课程选学员</select-lesson>
											</DropdownItem>
                                            <Dropdown placement="right-start">
                                                <DropdownItem>
                                                    按年级选学员
                                                    <Icon type="ios-arrow-right"></Icon>
                                                </DropdownItem>
                                                <DropdownMenu slot="list">
                                                    <DropdownItem v-for="(item,index) in dicts('grade')" :key="index" @click.native="getGradeStudents(item.name)">{{item.title}}</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
										</DropdownMenu> 
									</Dropdown>
								</Col>
								<Col span="8">
									<Checkbox 
										v-model="info.all_student" 
										:true-value="1" 
										:false-value="0"
										>所有学员
									</Checkbox>
								</Col>
								<Col span="8">
									<span class="clear" @click="clearStudents"><Icon type="ios-minus-outline"></Icon> 清空所有</span>
								</Col>
							</Row>
						</template>
						<template v-if="info.type==1">
							<Row align="middle">
								<Col span="6">
									<select-employee v-model="info.eids" @on-selected="selectEmployee">
										<span class="add"><Icon type="plus"></Icon> 选员工</span>
									</select-employee>
								</Col>
								<Col span="8">
									<Checkbox 
										v-model="info.all_employee" 
										:true-value="1" 
										:false-value="0"
										>所有员工
									</Checkbox>
								</Col>
								<Col span="8">
									<span class="clear" @click="clearEmployee"><Icon type="ios-minus-outline"></Icon> 清空所有</span>
								</Col>
							</Row>
						</template>
					</div>
					<div class="obj-container" :class="{'empty':isEmpty}">
						<div v-if="info.type==2">
							<p v-if="info.all_student">推送该校区所有学员</p>
							<Tag 
								closable 
								:color="item.first_openid?'green':'blue'" 
								v-for="(item,index) in students" 
								@on-close="delStudent(index)"
								>
								{{item.student_name}}
							</Tag>
						</div>
						<div v-else>
							<p v-if="info.all_employee">推送该校区所有员工</p>
							<Tag 
								closable 
								:color="item.openid?'green':'blue'" 
								v-for="(item,index) in employee" 
								@on-close="delEmployee(index)"
								>
								{{item.ename}}
							</Tag>
						</div>
					</div>
				</Card>
			</Col>
			<Col span="15">
				<Card dis-hover class="content" v-if="add">
					<div slot="title">发送内容</div>
					<div slot="extra" v-if="info.bc_type != 3">
						<Button type="ghost" size="small" @click="broadTemplate">模板库</Button>
					</div>
                    <div class="title">
						<label>公告类型</label>
						<Select v-model="info.bc_type">
							<Option :value="0" v-if="hasPer('notice.broadcast')">通知</Option>
                            <Option :value="1" v-if="hasPer('article.broadcast')">文章</Option>
                            <Option :value="2" v-if="hasPer('video.broadcast')">视频</Option>
                            <Option :value="3" v-if="hasPer('vocie.broadcast')">语音播报</Option>
						</Select>
					</div>
					<div class="title">
						<label>标题</label>
						<Input v-model="info.title"></Input>
					</div>
					<div class="title" v-if="info.bc_type != 3">
						<label>正文</label>
						<div class="ueditor">
							<umeditor 
								v-model="info.desc" 
								:config="{autoHeightEnabled:false,initialFrameHeight:318}"
								>
							</umeditor>
						</div>
					</div>
                    <div v-if="info.bc_type == 3" class="title">
						<label>有效期</label>
						<div>
							<date-range-picker 
							    v-model="in_time"
							    label="选择日期" 
							    placement="bottom"
							    style="width:100%">
						    </date-range-picker>
						</div>
					</div>
                    <div v-if="info.bc_type == 2 || info.bc_type == 3">
                        <review-upload ref="upload" :hideOptions="info.broadcast_file.length == 1 && info.bc_type == 3" v-model="info.broadcast_file"></review-upload>
                    </div>
                    <div v-if="info.bc_type == 1">
						<label>封面图</label>
                        <div class="img-upload img-upload-full">
							<div class="img-thumb" style="width:110px !important;height:110px;line-height: 110px;display: inline-block;">
								<Icon type="camera" size="30" v-if="info.cover_img_url == ''" style="line-height: inherit;"></Icon>
								<img :src="info.cover_img_url" @click="picturePreview(info.cover_img_url)" v-else>
							</div>
                            <div style="display: inline-block;position: relative;top: 35px;">
							    <p>图片大小建议(110px*110px)</p>
                                <c-upload
						        	v-model="info.cover_img_url"
						        	btn-text="上传"
						        >
						        </c-upload>
                            </div>
						</div>
                    </div>
				</Card>
				<div class="view-box" v-else>
					<div class="content">
						<p class="header">{{info.title}}</p>
						<p class="date">{{now_date}}</p>
						<p class="desc" v-html="info.desc"></p>
                        <file-item :list="info.broadcast_file" v-if="info.broadcast_file.length > 0"></file-item>
					</div>
				</div>
			</Col>
			<div class="edit-btn" @click="toggleAction">{{add?'预览':'返回'}}</div>
		</Row>
    	<div slot="footer">
			<Checkbox 
				v-model="info.is_push" 
                v-if="info.type != 3"
				:true-value="1" 
				:false-value="0" 
				style="float: left;position: relative;top: 5px;"
				>是否同时推送微信
			</Checkbox>
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="ok">确定</Button>
        </div>
    </Modal>
</template>
<script>
	import moment from 'moment'
 	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import Umeditor from 'c%/Umeditor'
	import SelectClass from 'c%/SelectClass'
	import SelectLesson from 'c%/SelectLesson'
	import SelectStudent from 'c%/SelectStudent'
    import SelectEmployee from 'c%/SelectEmployee'
    import reviewUpload from 'c%/reviewUpload.vue'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import FileItem from 'c%/FileItem.vue'
    import cUpload from 'c%/cUpload.vue'

	const emptyObject = {
		type: 2,
		dpt_ids: [],
		title: '',
		desc: '',
		is_push: 1,
		sids: [],
		eids: [],
		all_student:0,
        all_employee:0,
		broadcast_file:[],
		bc_type:0,
        cover_img_url:''
	}

	export default {
		mixins: [modal,common],
		props: {
			item: {
				type:Object,
				default:()=>{
					return {}
				}
			}
		},
		components: {
			Umeditor,
			SelectClass,
			SelectLesson,
			SelectStudent,
            SelectEmployee,
            reviewUpload,
            DateRangePicker,
            FileItem,
            cUpload
		},
		data() {
			return {
				add: true,
				cid: 0,
				lid: 0,
				students: [],
				employee: [],
                info: util.copy(emptyObject),
				in_time:[]
			}
		},
		watch: {
			'modal$.show'() {
				if(this.modal$.action == 'copy') {
					this.setCopyData(this.item)
				}
            },
            'info.bc_type':function(v){
				if(v == 0 || v == 1){
					this.info.broadcast_file = []
                	this.in_time = []
                }
                if(v != 1){
                    this.info.cover_img_url = ''
                }
            }
        },
		methods: {
			setCopyData(data) {
				let pushList = data.broadcast_push
				this.info.bc_type = data.bc_type
				this.info.title = data.title
				this.info.type = data.type
				this.info.desc = data.desc
                this.info.cover_img_url = data.cover_img_url
				this.info.broadcast_file = data.broadcast_file
				this.info.broadcast_file.forEach(item => {
					item.bcf_id = 0
					item.bc_id = 0
				})
				if(this.info.bc_type == 3){
					this.in_time = [
                    	this.$filter('int_date')(data.start_int_day),
                    	this.$filter('int_date')(data.end_int_day) 
                	]
				}
				pushList.forEach(pl => {
					if(pl.student) {
						this.students.push({
							sid: pl.student.sid,
							first_openid: pl.student.first_openid,
							student_name: pl.student.student_name
						})
						this.info.sids.push(pl.sid)
					} else if (pl.employee) {
						this.employee.push({
							eid: pl.employee.eid,
							openid: pl.employee.openid,
							ename: pl.employee.ename
						})
						this.info.eids.push(pl.eid)
					}
				})
			},
			broadTemplate() {
				this.$Modal.open('dashboard/home/broadcast/template-modal.vue',{
					on: {
						'on-ok':(data) => {
							this.info.title = data.name
							this.info.desc = data.html
						}
					}
				})
				.then(modal => {
					modal.show('选择模板')
				})
			},
			toggleAction() {
				this.add = !this.add
			},
			setStudents(data) {
				data.forEach(d => {
					let index = this.students.findIndex(s => s.sid==d.sid)
					if(index==-1) {
						this.students.push({
							sid: d.sid,
							first_openid: d.first_openid,
							student_name: d.student_name
						})
					}
				})
			},
			setSids(data) {
				data.forEach(d => {
					let index = this.info.sids.indexOf(d.sid)
					if(index == -1) {
						this.info.sids.push(d.sid)
					}
				})
			},
			getClassStudents(cid) {
				this.$rest('students')
				.get({
					cid:cid,
					pagesize:1000
				})
				.success(res => {
					let data = res.list
					this.setStudents(data)
					this.setSids(data)
					this.$store.commit('buildIdTextMap',{
	                   list:data,
	                   name:'student',
	                   ifield:'sid',
	                   tfield:'student_name'
	                })
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			getLessonStudents(lid) {
				this.$rest('lessons').add_url_param(lid,'students')
				.get({
					pagesize:1000
				})
				.success(res => {
					let data = res.list
					this.setStudents(data)
					this.setSids(data)
					this.$store.commit('buildIdTextMap',{
	                   list:data,
	                   name:'student',
	                   ifield:'sid',
	                   tfield:'student_name'
	                })
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
            },
            getGradeStudents(gid) {
				this.$rest('students')
				.get({
                    school_grade: gid
				})
				.success(res => {
                    let data = res.list
                    if(data.length == 0){
                        this.$Message.info('该年级下没有学员')
                    }else{
                        this.setStudents(data)
					    this.setSids(data)
                    }
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			delStudent(index) {
				this.students.splice(index,1)
				this.info.sids.splice(index,1)
			},
			delEmployee(index) {
				this.employee.splice(index,1)
			},
			selectClass(data) {
				this.getClassStudents(data.cid)
			},
			selectLesson(data) {
				this.getLessonStudents(data.lid)
			},
			selectStudent(data) {
				this.setStudents(data)
			},
			selectEmployee(data) {
				data.forEach(d => {
					let index = this.employee.findIndex(s => s.eid==d.eid)
					if(index==-1) {
						this.employee.push({
							eid: d.eid,
							openid: d.openid,
							ename: d.ename
						})
					}
				})
			},
			clearEmployee() {
				this.info.eids.splice(0)
				this.employee.splice(0)
			},
			clearStudents() {
				this.info.sids.splice(0)
				this.students.splice(0)
			},
			ok() {
				let info = util.copy(this.info)
				info.eids = this.employee.map(_=>_.eid)
				if(info.type==2) {
					if(info.sids.length==0&&info.all_student==0) {
						this.$Message.error('请选择推送学员')
						return
					}
				}
				if(info.type==1) {
					if(info.eids.length==0&&info.all_employee==0) {
						this.$Message.error('请选择推送员工')
						return
					}
				}
				if(info.title == '') {
					this.$Message.error('标题不能为空')
					return false
				}
				if(info.desc == '' && this.info.bc_type != 3) {
					this.$Message.error('内容不能为空')
					return false
                }
                
                if(info.bc_type == 2 && info.broadcast_file.length == 0){
                    this.$Message.error('请上传视频')
					return false
                }

                if(info.bc_type == 3){
                    if(info.broadcast_file.length == 0){
                        this.$Message.error('请上传语音')
					    return false
                    }
                    if(this.in_time.length == 0){
                        this.$Message.error('请选择有效期')
					    return false
                    }
                    info.start_int_day = this.$filter('format_int_day')(this.in_time[0])
                    info.end_int_day = this.$filter('format_int_day')(this.in_time[1])
                }

				this.$rest('broadcasts')
				.post(info)
				.success(res => {
					this.$Message.success('公告添加成功')
					this.$emit('save')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		},
		computed: {
			now_date() {
				return moment().format('YYYY-MM-DD')
			},
	        isEmpty() {
	        	if(this.info.type==2
	        		&&this.students.length==0
	        		&&this.info.all_student==0
	        		) {
	        		return true
	        	}
	        	if(this.info.type==1
	        		&&this.employee.length==0
	        		&&this.info.all_employee==0
	        		) {
	        		return true
	        	}
	        	return false
	        }
		}
	}
</script>
<style lang="less">
	.cast-info {
		.edit-btn {
			position: absolute;
			right: 0;
			top: 50%;
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background: #faad14;
			margin-top: -30px;
		    text-align: center;
		    line-height: 40px;
		    opacity: 0.8;
		    color: #fff;
		    z-index: 10000;
		    cursor: pointer;
		}
		.view-box {
			width: 300px;
		    height: 540px;
		    background: url(http://sp1.xiao360.com/static/img/phone.png) no-repeat 50%;
		    background-size: 100%;
		    position: relative;
		    margin: 0 auto;
		    .content {
		    	position: absolute;
		    	top: 50px;
		    	left: 20px;
		    	width: 262px;
		    	height: 460px;
		    	padding: 10px;
		    	overflow: auto;
		    	.header {
		    		font-size: 18px;
		    		font-weight: 600;
		    	}
		    	.date {
		    		font-size: 12px;
		    		color: #999;
		    	}
		    	.desc {
		    		p {
		    			white-space: normal !important;
		    			width: auto !important;
		    		}
		    		img {
		    			max-width: 100%;
		    		}
		    	}
		    	&::-webkit-scrollbar{
		    		display: none;
		    	}
		    }
		}
		.select-condition {
			margin-top: 10px;
			margin-bottom: 10px;
			font-size: 12px;
			.ivu-select {
				font-size: 12px;
				vertical-align: 1px;
			}
			.add,.clear {
				cursor: pointer;
			}
			label {
				margin-bottom: 0;
			}
		}
		.obj-container {
			padding-top: 8px;
			border-top: 1px solid #e3e8ee;
			height: 478px;
			overflow: auto;
			.ivu-tag {
				height: 28px;
				line-height: 28px;
				margin: 5px 8px 5px 0;
			}
			&.empty {
			    background: url(http://s1.xiao360.com/nothing-notice.png) no-repeat 50%;
    			background-size: 20%;
			}
		}
		.content {
			.title {
				margin-bottom: 10px;
			}
			label {
				margin-bottom: 6px;
				font-size: 12px;
			}
			.ivu-card-extra {
				top: 10px;
			}
		}
		.ueditor {
			.edui-container {
				box-shadow: none;
				border: 1px solid #e3e8ee;
			}
			.edui-container .edui-toolbar {
				box-shadow: none;
				border-bottom: 1px solid #e3e8ee;
			}
		}
	}
</style>