<style lang="less" scoped>
.db-service {
	.box-container {
		position: relative;
		margin-top: 15px;
	}
	.box {
		height: 100%;
		padding: 0 12px;
		background: #fff;
	    border-color: #dee5e7;
	    border-radius: 5px;
	    background-clip: padding-box;
	    box-shadow: 0 1px 2px 0 rgba(230,230,230,1);
	    &.fast-apps {
	    	position: absolute;
	    	top: 0;
	    	left: 0;
	    	width: 540px;
	    }
	    &.course-arrange {
	    	margin-left: 550px;
	    	margin-right: 210px;
	    	.header {
	    		position: relative;
	    		.active {
	    			color: #39f;
	    		}
	    	}
	    	.arrange-date {
	    		position: absolute;
	    		top: 0;
	    		left: 45%;
	    		color: #3091f2;
	    		cursor: pointer;
	    		text-decoration: underline;
	    	}
	    	.ivu-btn-group {
	    		position: absolute;
	    		top: 8px;
	    		right: 10px;
	    	}
	    	.ivu-btn {
	    		padding: 2px;
	    	}
	    	.schedule-arranges {
				height: calc(~'100% - 62px');
				overflow: auto;
				padding: 15px;
				border: 1px solid #ededed;
				border-left: 0;
				background: #f5f5f5;
				margin-top: 10px;
				&.empty-img {
					background: url('http://s1.xiao360.com/nothing-notice.png') no-repeat center;
					background-color: #f5f5f5;
				}
				&-item {
					margin-bottom: 15px;
					background: #fff;
					border-radius: 6px 0 0 0;
					cursor: pointer;
					box-shadow: 0 1px 2px 0 rgba(230,230,230,1);
					.info {
						text-align: center;
						line-height: 40px;
						&.is-attended {
							color: #19be6b;
							.info-section.current {
								background: #19be6b;
								color: #fff;
							} 
						}
						&.part-attended {
							color: #ff9900;
							.info-section.current {
								background: #ff9900;
								color: #fff;
							}
						}
						.info-section {
							position: relative;
							border-radius: 6px 0 0 0;
							&.current {
								background: #50A8FF;
								color: #fff;
								&:after {display: none;}
							}
						}
						.info-ename {
							position: relative;
							.ivu-icon-person {
								vertical-align: middle;
							}
						}
						.info-section,.info-ename {
							&:after {
								content: '';
								width: 80%;
								height: 1px;
								background: #ebedf0;
								position: absolute;
								bottom: 0;
								left: 0;
								right: 0;
								margin: 0 auto;
								transform: scaleY(0.7);
							}
						}
					}
					.students {
						position: relative;
						padding: 8px 10px;
						height: 118px;
						overflow:auto;
						line-height: 26px;
						&::-webkit-scrollbar {
							display: none;
						}
						&:before {
							content: ' ';
							width: 1px;
							height: 100%;
							position: absolute;
							top: 0;
							left: 0;
							transform: scaleX(0.7);
							background: #ebedf0;
						}
						.lesson-type {
							position: absolute;
							right: 0;
							top: 0;
							width: 22px;
							height: 22px;
							border-radius: 0 0 0 20px;
							padding: 5px;
							color: #fff;
							background: #3091f2;
							line-height: 13px;
							display: block;
						}
						.class-name {
							text-align: center;
							line-height: 14px;
							&.remind {
								text-align: left;
							    margin-left: 10px;
							    line-height: 26px;
							    border-bottom: 1px solid #ededed;
							    label {
							    	margin-bottom: 0;
							    }
							}
						}
						
						.student-box {
							display: inline-block;
							margin-left: 10px;
						}
					}
				}
			}
	    }
	    &.cycle-apps {
	    	position: absolute;
	    	top: 0;
	  		right: 0;
	  		width: 200px;
	  		.apps {
	  			flex-direction: column;
	  			.app-item {
	  				width: 176px;
	  			}
	  		}
	    }
	    .header {
	    	position: relative;
	    	font-size: 14px;
	    	line-height: 40px;
	    	padding-left: 10px;
	    	&:after {
	    		content: ' ';
	    		position: absolute;
	    		left: 1px;
	    		right: 0;
	    		bottom: 0;
	    		transform: scaleY(0.8);
	    		border-bottom: 1px solid #ebedf0;
	    	}
	    }
	    .apps {
	    	display: flex;
	    	flex-wrap: wrap;
	    	justify-content: flex-start;
	    	align-items: center;
	    	margin: 15px 0;
	    	.app-item {
		    	width: 120px;
		    	text-align: center;
		    	padding: 20px;
		    	img {
		    		margin-bottom: 10px;
		    		cursor: pointer;
		    	}
		    }
	    }
	}
}
</style>
<style>
	.class-badge-alone{
		background-color: #4CAF50 !important;
	}

	.student-badge-alone{
		background-color: #2196F3 !important;
	}
</style>

<template>
	<div class="db-service">
		<div class="box-container" :style="{height: height+'px'}">
			<div class="box fast-apps">
				<template v-for="(val,key) in ui_config">
					<div :class="key" v-if="key!=='cycle'">
						<div class="header">
							<strong>{{val.text}}</strong>
						</div>
						<div class="apps">
							<div class="app-item" v-for="item in val.items">
								<img :src="item.icon" @click="showServiceModal(item)">
								<p>{{item.text}}</p>
							</div>
						</div>
					</div>
				</template>
			</div>
			<div class="box course-arrange">
				<div class="header">
					<strong>今日课表</strong>
					<ButtonGroup>
						<Button 
							type="text" 
							size="small" 
							title="我的" 
							icon="person" 
							:class="{'active':type_arrange=='my'}"
							@click="changeType('my')">
						</Button>
						<Button 
							type="text" 
							size="small" 
							title="所有" 
							icon="person-stalker" 
							:class="{'active':type_arrange=='all'}"
							:disabled="!hasPer('arrange.checkAll')" 
							@click="changeType('all')">
						</Button>
					</ButtonGroup>
					<div class="arrange-date">
						<Button 
							type="text" 
							size="small" 
							icon="chevron-left" 
							:loading="loading" 
							@click="dayChange('prev')"
							>
						</Button>
						<span @click="setDay">{{format_date}}</span>
						<Button 
							type="text" 
							size="small" 
							icon="chevron-right" 
							:loading="loading" 
							@click="dayChange('next')">
						</Button>
					</div>
				</div>
				<div :class="['schedule-arranges',data.length==0?'empty-img':'']">
					<div class="schedule-arranges-list">
						<Row class="schedule-arranges-item" v-for="item in orderBy(data,'int_start_hour')" @click.native="showServiceDetail(item)">
							<Col span="6" :class="['info',item.is_attendance==1?'part-attended':item.is_attendance==2?'is-attended':'']">
								<div :class="['info-section',is_current_section(item)]">{{getFormatSection(item)}}</div>
								<div class="info-ename">
									<Icon type="person" size="14"></Icon>
									{{item.teach_eid|ename}}
								</div>
								<div class="info-room">
									<Icon type="ios-home" size="14"></Icon>
									{{item.cr_id|classroom_name('未知')}}
								</div>
							</Col>
							<Col span="18" class="students">
								<div class="class-name">
									<span v-if="item.is_trial">{{item.name}}</span>
									<span v-else>{{item.course_name}}</span>
								</div>
								<div class="student-box" v-for="student in item.students">
									<span v-if="student.sid > 0">{{student.student.student_name}}</span>
									<span v-else-if="student.sid == 0 && student.cu_id > 0">{{student.customer.name}}</span>
								</div>
								<div class="lesson-type" v-if="getLessonType(item)">{{getLessonType(item)}}</div>
							</Col>
						</Row>
					</div>
				</div>
			</div>
			<div class="box cycle-apps">
				<div class="header">
					<strong>周期服务</strong>
				</div>
				<div class="apps">
					<div class="app-item" v-for="item in ui_config.cycle.items" @click="showServiceModal(item)">
						<img :src="item.icon">
						<p>{{item.text}}</p>
					</div>
					<template v-if="hasPer('week.service_remind')">
						<div class="app-item" v-for="(item,index) in service_data" :key="index">
							<Poptip placement="left" width="400" trigger="hover">
    						    <Badge :count="item.service_object.length" overflow-count="99">
									<Badge :count="item.teach_object_type == 0 ? '班级' : '个人'" :class-name="item.teach_object_type == 0 ? 'class-badge-alone' : 'student-badge-alone'" style="position: absolute;top: -10px;right: -57px;"></Badge>
    						    	<img src="http://sp1.xiao360.com/static/ui/student/menu_week_service_remind.png" width="60">
    							</Badge>
								<p>{{item.rule_name}}</p>
								<div class="api" slot="content" style="max-height:300px;overflow: auto;">
									<table class="modal-table">
										<thead>
	            							<tr>
												<th><div class="ivu-table-cell">#</div></th>
	            								<th><div class="ivu-table-cell">服务对象</div></th>
												<th><div class="ivu-table-cell">已上课</div></th>
												<th><div class="ivu-table-cell">需服务</div></th>
												<th><div class="ivu-table-cell">已服务</div></th>
	            								<th><div class="ivu-table-cell">操作</div></th>
	            							</tr>
	            						</thead>
										<tbody>
											<tr v-for="(v,i) in item.service_object" :key="i" style="height:50px;">
												<th><div class="ivu-table-cell">{{i + 1}}</div></th>
												<th><div class="ivu-table-cell">{{item.teach_object_type == 0 ? v.class_name : v.student_name}}</div></th>
												<th><div class="ivu-table-cell">{{v.attendance_times}}次</div></th>
												<th><div class="ivu-table-cell">{{v.need_do_times}}次</div></th>
												<th><div class="ivu-table-cell">{{v.did_times}}次</div></th>
			
												<th>
													<div class="ivu-table-cell">
														<Button class="ml-2" type="default" icon="plus"  @click="record(item,v)">记录</Button>
													</div>
												</th>
											</tr>
										</tbody>
									</table>
								</div>
    						</Poptip>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	function getFormatDate() {
		return moment().format('YYYY - MM - DD')
	}

	export default {
		mixins: [common,grid,globals],
		data() {
			return {
				rest_api: 'course_arranges',
				currentDate: new Date(),
				type_arrange: 'all',
				service_data:[]
			}
		},
		mounted() {
			if(!this.hasPer('arrange.checkAll')) {
				this.type_arrange = 'my'
			}
			this.init_data()
			this.get_service_data()
		},
		watch: {
			type_arrange() {
				this.init_data()
			},
			currentDate() {
				this.init_data()
			}
		},
		methods: {
			get_service_data(){
				let url = this.hasPer('service_week.all') ? 'service_tasks/service_reminds' : 'service_tasks/service_reminds?eid=' + this.eid$
				this.$rest(url)
				.get()
				.success(data => {
					this.service_data = data.list.filter(item => {
						return item.service_object.length > 0
					})
				})
				.error(res => {
					console.log(res.body.message)
				})
			},
			record(item,v) {
				this.$Modal.open('service/service/record-modal.vue',{
					props: {
						cid: item.teach_object_type == 0 ? v.cid : 0,
						sid: item.teach_object_type == 1 ? v.sid : 0,
						st_did: item.st_did,
						type: item.teach_object_type == 0 ? 2 : 1
					},
					on:{
						'on-success':()=>{
							this.get_service_data()
						}
					}
				})
				.then(modal=>{
					modal
					.show('添加服务记录','add')
				})
			},
			changeType(type) {
				this.type_arrange = type
			},
			showServiceDetail(item) {
				let int_day = this.$filter('int_date')(item.int_day)
				let int_hour = this.$filter('int_hour')(item.int_start_hour) +'~' +this.$filter('int_hour')(item.int_end_hour)
				this.$Modal.open('dashboard/service/course-detail.vue@modal',{
					props: {
						arrange: item
					},
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('%s%s %s 服务详情',item.course_name,int_day,int_hour))
				})
			},
			showServiceModal(item) {
				if(item.name=='arrive'||item.name=='leave') {
					this.$Modal.open(item.uri,{
						props: {
							mode:item.name
						}
					})
					.then(modal=>{
						modal.show(item.text)
					})
				}
				else if(item.name=='attend') {
					this.$Modal.open(item.uri,{
						on: {
							'on-success':() => {
								this.init_data()
							}
						}
					})
					.then(modal=>{
						modal.show(item.text)
					})
				}
				else{
					this.$Modal.open(item.uri)
					.then(modal=>{
						modal.show(item.text)
					})
				}
			},
			setDay() {
				this.$Modal.open('business/attendance/set-day-modal.vue',{
					props: {

					},
					on: {
						'on-ok': (date)=>{
							this.dayChange('set',date)
						}
					}
				})
				.then(modal=>{
					modal.show('设置课表日期')
				})
			},
			is_current_section(item) {
				let date = new Date(),
					hour = date.getHours(),
					minute = date.getMinutes(),
					int_hour = hour*100+minute
				if(item.int_start_hour<=int_hour
					&&item.int_end_hour>=int_hour
					&&date.toLocaleDateString()==this.currentDate.toLocaleDateString()) return 'current'
				return ''
			},
			getFormatSection(item) {
				return util.sprintf('%s -- %s',this.$filter('int_hour')(item.int_start_hour),
							this.$filter('int_hour')(item.int_end_hour))
			},
			getLessonType(data) {
				let result = ''
				if(data.lesson_type===0){
					if(data.is_trial===1||data.is_makeup===1){
						result = data.is_trial===1?'试':'补'
					}
				}
				return result
			},
			hook_get_param(param) {
				param.int_day = moment(this.currentDate).format('YYYYMMDD')
				param.with = 'one_class,students,class_attendance,textbook,textbook_section'
				param.is_cancel = 0
				param.pagesize = 1000
				if(this.type_arrange == 'my') {
					param.teach_eid = this.eid$
				}
			},
			dayChange(action,date){
				let dt = this.currentDate.getDate()
				if(action == 'prev'){
					this.currentDate = new Date(this.currentDate.setDate(dt-1))
				}else if(action == 'next'){
					this.currentDate = new Date(this.currentDate.setDate(dt+1))
				}
				else {
					this.currentDate = date;
				}
				this.init_data()
			},
		},
		computed: {
			height() {
				return util.get_client_height() - 215
			},
			ui_config() {
				return this.$store.state.gvars.configs.org_service_dashboard
			},
			format_date() {
				return moment(this.currentDate).format('YYYY - MM - DD')
			}
		}
	}
</script>