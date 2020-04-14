<style>
	.time {
		width: 110px;
		height: 22px;
		font-size: 15px;
		line-height: 22px;
		padding: 0px 6px;
		text-align: center;
		background-color: #3399FF;
		color: white;
		border-radius: 3px;
		position: relative;
		top: -2px;
	}

	.chat_box {
		width: 470px;
		border-radius: 8px;
		border: 1px solid #60baff;
		margin-top: 5px;
		background-color: #EFF4F8;
		position: relative;
		margin-left: 18px;
		padding-bottom: 15px;
	}

	.chat_box table {
		width: 95%;
		margin: 0 auto;
		border-collapse: separate;
		border-spacing: 12px;
		margin-top: 10px
	}

	.chat_box td:nth-child(odd){
		text-align: right;
		color: #657180;
	}

	.chat_box td:nth-child(even){
		position: relative;
		left: -10px;
		color: #333333
	}

	.chat_content {
		position: relative;
		top: 5px;
		left: 30px;
		color: #333;
		width: 90%;
	}

	.chat_angle {
		width: 12px;
		height: 12px;
		border-left: 1px solid #35a8ff;
		border-bottom: 1px solid #35a8ff;
		background-color: #EFF4F8;
		position: absolute;
		top: 20px;
		left: -7px;
		transform: rotate(45deg);
	}
</style>


<template>
	<div class="customer-follow-record">
		<div class="box-result box">
			<Timeline style="margin-left:30px">
				<TimelineItem v-for="items in data">
					<Icon type="record" slot="dot"></Icon>
					<p class="time">{{items.create_time.split(' ')[0]}}</p>
					<p class="content">
						<div class="chat_box">
							<table>
								<tr>
									<td>跟进人：</td>
									<td style="color:#3399FF">{{items.eid|ename}}</td>
									<td>有效性：</td>
									<td>{{items.is_connect==1?'有效':'无效'}}</td>
									<td>具体时间：</td>
									<td>{{items.create_time.split(' ')[1]}}</td>
								</tr>
								<tr>
									<td>下次跟进时间：</td>
									<td>{{items.next_follow_time==0?'待定':nextFollowTime(items.next_follow_time)}}</td>
								</tr>
								<tr>
									<td>沟通内容：</td>
									<td>{{items.content}}</td>
								</tr>						
							</table>
						</div>
					</p>
				</TimelineItem>
				<TimelineItem>
					<Icon type="x" slot="dot"></Icon>
				</TimelineItem>
			</Timeline>
			<div v-if="data.length == 0">暂无沟通记录</div>
			<Page v-else :current="pageIndex" :total="total" @on-change="pagesize" />
        </div>
    </div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'

	export default{
		mixins: [grid,globals,common,modal],
		props: {
			cuId: {
				type:[Number,String],
				default: ()=> {
					return 0
				}
			},
			mode: {
				type: String,
				default: ()=>{
					return 'list'
				}
			}
		},			
		data () {
			return {
				rest_api: '',
				pk: 'mcl_id',	
				id: 0,
			}
		},
		watch: {
			'cuId': function (val) {
				this.rest_api = 'mc_follow_ups?mcl_id=' + val
				this.init_data()
			}
		},
		mounted () {
			this.id = this.cuId?this.cuId:this.$route.params.id
			this.rest_api = 'mc_follow_ups?mcl_id=' + this.id
			this.init_data()
		},
		methods: {
			nextFollowTime(num) {
				return moment(num).format("YYYY-MM-DD");
			}
		}
	}
</script>
