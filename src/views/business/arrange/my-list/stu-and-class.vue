<style lang="less">
	@import '~@/style/mixin.less';
	.my-arrange {
		position: relative;
		min-height: 700px;
		&-list {
			margin-left: 365px;
		}
		&-object {
			position: absolute;
			width: 345px;
			left: 10px;
			top: 0;
			padding: 5px !important;
		}
		&-tab {
			padding: 5px;
			border-bottom: 1px solid #ccc;
		}
		&-head {
			height:30px;
			line-height:30px;
			border-bottom:1px solid #ccc;
			padding-left:5px;
			color:#000;
			font-weight:bold;
		}
		&-body {
			padding: 5px;
			.list-wrap {
				margin-top:5px;
				overflow-y:auto;
				.list-item {
					padding: 5px;
					cursor: pointer;
					border-bottom: 1px solid #d7dde4;
					position: relative;
					.ivu-icon-chevron-up,.ivu-icon-chevron-down {
						position: absolute;
						right: 0;
						top: 20px;
					}
					.student-lessons {
						margin-right: 10px;
						.lesson {
							border-top: 1px solid #f2f2f2;
							padding-left: 36px;
							&:first-child {
								border-top: none;
							}
						}
					}
					.student {
						margin-right: 10px;
						display: flex;
						align-items: center;
						.student-name {
							flex: 0 0 100px;
						}
						.percent-wrap {
							flex: 1;
						}
					}
					.student,.lesson,.class {
						padding:5px;
						&:hover {
							background:#eee;
						}
					}
					.active {
						background: #d5eeff !important;
					}
				}
			}
		}
	}
</style>
<template>
	<div class="box my-arrange-object">
		<div class="my-arrange-head">
			<p><Icon type="android-person"></Icon>我的</p>
		</div>
		<div class="my-arrange-tab">
			<RadioGroup v-model="type" type="button" size="small">
				<Radio :label="1">我的学员</Radio>
				<Radio :label="2">我的班级</Radio>
			</RadioGroup>
		</div>
		<div class="my-arrange-body">
			<template v-if="type==1">
				<div class="list-filter">
					<Input 
						v-model="data1.key" 
						size="small" 
						icon="search" 
						placeholder="请输入学员名称过滤">
					</Input>
				</div>
				<div class="list-wrap" :style="{height:maxHeight+'px'}">
					<div class="list-item" v-for="item in filterStudents">
						<div :class="['student',item.sid==data1.id&&data1.lid==0?'active':'']" @click="selectStudent(item)">
							<div class="student-name">
								<Tag 
									color="blue" 
									type="border"
									@click="selectStudent(item)">
									{{item.student_name}}
								</Tag>
							</div>
							<div class="percent-wrap">
								<Progress 
									:percent="studentHoursPercent(item)" 
									:stroke-width="5">
									{{item.student_lesson_remain_hours}}/{{item.student_lesson_hours}}
								</Progress>
							</div>
						</div>
						<template v-if="item.student_lesson.length>0">
							<Icon type="chevron-up" v-if="item.expand$" @click.native="item.expand$=false"></Icon>
							<Icon type="chevron-down" v-else @click.native="item.expand$=true"></Icon>
						</template>
						<div class="student-lessons" v-show="item.expand$">
							<div 
								:class="['lesson',item.sid==data1.id&&data1.lid==lesson.lid?'active':'']" 
								v-for="lesson in item.student_lesson" 
								@click="selectStudentLesson(item,lesson)">
								<span class="mr-2">{{lesson.lid|lesson_name}}</span>
								<span>{{lesson.remain_lesson_hours}}/{{lesson.lesson_hours-lesson.refund_lesson_hours-lesson.transfer_lesson_hours}}</span>
							</div>
						</div>
					</div>
					<p class="empty" v-if="filterStudents.length == 0">没有数据</p>
				</div>
			</template>
			<template v-if="type==2">
				<div class="list-filter">
					<Input 
						v-model="data2.key" 
						size="small" 
						icon="search" 
						placeholder="请输入班级名称过滤">
					</Input>
				</div>
				<div class="list-wrap" :style="{height:maxHeight+'px'}">
					<div class="list-item" v-for="item in filterClasses">
						<div class="class" :class="['class',item.cid==data2.id?'active':'']" @click="selectClass(item)">
							<Tag 
								color="blue" 
								type="border" 
								@click="selectClass(item)">
								{{item.class_name}}
							</Tag>
							<Progress 
								:percent="classArrangePercent(item)" 
								:stroke-width="5">
								{{item.arrange_times}}/{{item.lesson_times}}
							</Progress>
						</div>
					</div>
					<p class="empty" v-if="filterClasses.length == 0">没有数据</p>
				</div>
			</template>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
		mixins: [common,globals],
		data() {
			return {
				type: 1,
				data1: {
					url: '',
					key: '',
					list: [],
					id: 0,
					lid: 0
				},
				data2: {
					url: '',
					key: '',
					list: [],
					id: 0
				}
			}
		},
		computed: {
			filterStudents() {
				let list = this.data1.list,
					key = this.data1.key
				if(!/^\s*$/.test(key)) {
					list = list.filter(item=>item.student_name.indexOf(key) > -1)
				}
				return list
			},
			filterClasses() {
				let list = this.data2.list,
					key = this.data2.key
				if(!/^\s*$/.test(key)) {
					list = list.filter(item=>item.class_name.indexOf(key) > -1)
				}
				return list
			},
			maxHeight() {
				return util.get_client_height() - 360
			}
		},
		mounted() {
			this.data1.url = this.myStudentApi + '&pagesize=10000&with=student_lesson'
			this.data2.url = this.myClassApi + '&pagesize=10000'
			this.get_data_list(1)
		},
		methods: {
			get_data_list(type) {
				let k = 'data'+type,
					url = this[k].url
				this.dr().refreshData(url)
				.then(res => {
					res.list.forEach(item=>{item.expand$=true})
					this[k].list = res.list
					if(res.list.length>0&&this[k].id==0) {
						this[k].id = type==1?res.list[0].sid:res.list[0].cid
						this.$emit('on-select',{
							type:type,
							id:this[k].id,
							lid:res.list[0].lid?res.list[0].lid:0,
							name:type==1?res.list[0].student_name:res.list[0].class_name,
							data:res.list[0]
						})
					}
				})
			},
			studentHoursPercent(item){
				return util.div(item.student_lesson_remain_hours,item.student_lesson_hours)*100
			},
			classArrangePercent(item){
				return util.div(item.arrange_times,item.lesson_times)*100
			},
			selectStudent(item) {
				this.data1.id = item.sid
				this.data1.lid = 0
				this.$emit('on-select',{
					type:1,
					id:item.sid,
					lid:0,
					name:item.student_name
				})
			},
			selectStudentLesson(item,lesson) {
				lesson.student = item
				this.data1.id = item.sid
				this.data1.lid = lesson.lid
				this.$emit('on-select',{
					type:1,
					id:item.sid,
					lid:lesson.lid,
					name:item.student_name,
					data:lesson
				})
			},
			selectClass(item) {
				this.data2.id = item.cid
				this.data2.lid = item.lid
				this.$emit('on-select',{
					type:2,
					id:item.cid,
					lid:item.lid,
					name:item.class_name,
					data:item
				})
			}
		},
		watch: {
			type(val) {
				this.get_data_list(val)
				this.$emit('on-change',val)
			}
		}
	} 
</script>