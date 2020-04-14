<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="1200" @on-cancel="close">
		<Alert type="info" show-icon>
			您的校360系统还没有进行初始化设置
			<span slot="desc">请点击下面的设置菜单，依照从左到右，从上到下的顺序 依次对系统进行设置</span>
		</Alert>
		<div class="set-wrap">
			<div class="line" v-for="line in data">
				<div 
				    :class="{'active':is_current(item)}"
					class="item" 
					v-for="item in line"
					@click="push(item.url)">
					<i :class="item.icon"></i>
					<div class="content">
						<label>{{item.label}}</label>
						<p>{{item.text}}</p>
					</div>
				</div>
			</div>
			<div class="separation"></div>
			<div class="business">
				<h4>业务流程</h4>
				<div class="process">
					<div 
						:class="{'active':is_current(item)}"
						class="flow" 
						v-for="item in business" 
						@click="push(item.url)">
						<i :class="item.icon"></i>
						<div class="content">
							<label>{{item.label}}</label>
							<p>{{item.text}}</p>
						</div>
						<span class="arrow"></span>
					</div>
				</div>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="closeGuide">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		data() {
			return {
				data: [
					[
						{
							icon: 'icon-department',
							label: '部门设置',
							text: '按照公司的组织架构设置部门和校区，这是进行后续操作的必要条件。',
							url: '/system/staff/departments'
						},
						{
							icon: 'icon-staff',
							label: '员工设置',
							text: '录入员工的基本信息，给员工创建登录账号及分配权限组。',
							url: '/system/staff/employees'
						},
						{
							icon: 'icon-classroom',
							label: '教室设置',
							text: '添加校区的教室，设置好之后才可以进行排班排课。',
							url: '/system/basic/classrooms'
						},
						{
							icon: 'icon-lesson',
							label: '科目设置',
							text: '设置好科目之后才能创建班级等操作。',
							url: '/system/basic/subject'
						}
					],
					[
						{
							icon: 'icon-time',
							label: '上课时间段设置',
							text: '设置好上课时间段之后才可以进行排班排课',
							url: '/system/basic/time'
						},
						{
							icon: 'icon-holiday',
							label: '节假日设置',
							text: '节假日设置之后会会在排课的时候自动避开节假日',
							url: '/system/basic/holiday'
						},
						{
							icon: 'icon-goods',
							label: '物品管理',
							text: '可对校区的物品进行数量管控',
							url: '/app/materials'
						},
						{
							icon: 'icon-else',
							label: '其他参数设置',
							text: '设置系统中各项选项的条目及个性化设置提高操作效率',
							url: '/system/dicts'
						}
					]
				],
				business: [
					{
						icon: 'icon-sign-up',
						label: '报名',
						text: '新学员购买课程及缴费',
						url: '/dashboard/signup'
					},
					{
						icon: 'icon-pay-',
						label: '收费',
						text: '老学员购买课程及缴费',
						url: '/dashboard/payment'
					},
					{
						icon: 'icon-class',
						label: '排班',
						text: '班级管理及可视化的排班排课操作',
						url: '/business/class/list'
					},
					{
						icon: 'icon-arrange-lesson',
						label: '排课',
						text: '整个校区的排课管理及可视化排课',
						url: '/business/arrange/lists'
					},
					{
						icon: 'icon-kaoqin',
						label: '考勤',
						text: '记录学员的出勤情况',
						url: '/business/attendance/teach'
					},
				]
			}
		},
		methods: {
			push(url) {
				this.$store.commit('setGuideOn')
				this.close()
				this.$router.push({path: url})
			},
			is_current(item){
				return this.$route.path == item.url
			},
			closeGuide(){
				this.$store.commit('setGuideOff')
				this.close()
			}
		},
		computed: {
			
		}
	}
</script>
<style lang="less">
	.set-wrap {
		.item {
			display: inline-block;
			width: 280px;
			height: 120px;
			margin-right: 16px;
			margin-bottom: 16px;
			padding: 20px 10px;
			background: #f0f0f0;
			cursor: pointer;
			i {
				float: left;
				font-size: 45px;

			}
			.content {
				padding-left: 60px;
				label {
					font-size: 16px;
				}
				p {
					height: 55px;
					overflow: auto;
				}
			}
			&:last-child {
				margin-right: 0 !important;
				float: right;
			}
			&.active{
				background:#03A9F3;
				color:#fff;
				i{
					color:#fff;
					&:before{
						color:#fff !important;
					}
				}
			}
		}
		.separation {
			height: 10px;
			background: #f0f0f0;
		}
		.business {
			h4 {
				padding: 14px 0;
				font-size: 14px;
	    		color: #464c5b;
			}
			.process {
				height: 98px;
				background:#f0f0f0;
				.flow {
					position:relative;
					display: inline-block;
					width: 230px;
					height: 98px;
					padding: 20px 0 0 20px;
					cursor: pointer;
					background:#f0f0f0;
					i {
						float: left;
						font-size: 45px;
						color: #fff;
					}
					.content {
						padding-left: 60px;
						label {
							font-size: 16px;
						}
						p {
							height: 36px;
							overflow: auto;
						}
					}
					.arrow{
						display:block;
						position:absolute;
						left:232px;
						width:23px;
						height:98px;
						top:0;
						z-index:10;
						background:url(../../../img/arrow_right.png) 0 0 no-repeat;
					}
					&:last-child {
						width:248px;
						margin-right: 0 !important;
						.arrow{
							display:none;
						}
					}
					&.active{
						background:#03A9F3;
						color:#fff;
						i{
							color:#fff;
							&:before{
								color:#fff !important;
							}
						}
						.arrow{
							background:url(../../../img/arrow_right_active.png) 0 0 no-repeat;
						}
					}
				}
			}
		}
	}
</style>