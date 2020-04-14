<template>
	<div class="c-grid app-info" style="position: relative;">
		<data-ready ref="dr" :cache="false" :data="info_url" @refresh="refresh" @ready="dataReady">
			<Card dis-hover :bordered="false" :padding="30" shadow>
				<div slot="title" style="display: flex;font-size: 12px;padding: 16px 14px;">
					<div class="app-icon">
						<img :src="data.app_icon_uri"/>
						<span class="tag" v-if="data.action=='enable'&&data.is_system==1">已启用</span>
					</div>
					<div class="app-desc">
						<h3>
							{{data.app_name}}
							<ButtonGroup class="pull-right">
								<Button 
									:class="data.action=='enable'?'close-btn':'open-btn'" 
									type="ghost"
									@click="doaction"
									v-if="data.is_system==1"
									>
									{{data.action=='enable'?'关闭':'开启'}}
								</Button>
								<template v-else>
									<Button
										v-if="data.is_buy==1"
										class="close-btn"
										@click="renewal"
										>
										续费
									</Button>
									<Button
										v-else
										class="open-btn"
										@click="renewal"
										>
										购买
									</Button>
								</template>
								<Button type="ghost" @click="$router.go(-1)">返回</Button>
							</ButtonGroup>
						</h3>
						<div class="desc">{{data.app_desc}}</div>
						<div class="user" v-if="data.is_system==0&&data.is_buy==1">
							<Progress 
								:percent="volume_percent" 
								:status="volume_status"
								:stroke-width="12"
								class="volume-percent"
								v-if="data.price_type==2"
								>
								{{data.volume_limit - data.volume_used}} / {{data.volume_limit}}分钟
							</Progress>
							<div v-else-if="data.price_type==1">
								<span>{{data.expire_int_day|int_date}}</span>
								<span :class="remain_days>15?'text-success':'text-danger'">
									{{remain_days>0?`剩余 ${remain_days} 天`:`已过期 ${-remain_days} 天`}}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="pictures">
					<Carousel loop v-if="data.pics" arrow="always">
						<CarouselItem v-for="item in data.pics" >
							<img :src="item" style="max-width: 100%">
						</CarouselItem>
					</Carousel>
				</div>
			</Card>
		</data-ready>
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import DataReady from 'c%/DataReady.vue'
	export default {
		mixins: [common,globals],
		components: {
			DataReady
		},
		data() {
			return {
				data: {
					expire_int_day: 0
				},

			}
		},
		methods: {
			dataReady (rs) {	
				this.data = rs[0]				
			},
			refresh (rs) {
				this.data = rs.response 
			},
			refreshData () {
				this.$r('dr').refreshData(this.info_url[0])
			},
			renewal() {
				this.$Message.info('请与您的销售经理联系购买!')
			},
			doaction() {
				let message = this.data.action=='enable'?'禁用成功':'启用成功'
				this.$rest('apps')
				.post({
					app_ename: this.data.app_ename
				})
				.success(res => {
					this.$Message.success(message)
					this.getGlobalAll()
					this.refreshData()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			getGlobalAll() {
				this.$rest('global/all')
				.get()
				.success(res => {
					this.$store.commit('setGlobalVars',res)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		},
		computed: {
			info_url() {
				return ['apps/'+this.$route.params.id]
			},
			volume_percent() {
            	let limit = this.data.volume_limit
            	let used = this.data.volume_used
            	if(!limit) {
            		return 0
            	}
            	return Math.round((limit - used) / limit * 100)
            },
            volume_status() {
            	if(this.volume_percent == 0) {
            		return 'normal'
            	}else if(this.volume_percent == 100) {
            		return 'success'
            	}else if(this.volume_percent > 0 && this.volume_percent < 10) {
            		return 'wrong'
            	}else{
            		return 'active'
            	}
            },
            remain_days() {
				return moment(util.format_int_day(this.data.expire_int_day)).diff(moment(new Date()),'days')
			}
		}
	}
</script>
<style lang="less">
	.app-info {
		.app-icon {
			position: relative;
			margin-right: 20px;
			.tag {
				position: absolute;
				left:0;
				bottom: 0;
				width: 100%;
				height: 25px;
				line-height: 25px;
				text-align: center;
				border-bottom-right-radius: 8px;
				border-bottom-left-radius: 8px;
				color: #fff;
				background: #42B983;
			}
		}
		.app-desc {
			flex: 1;
			h3 {
				font-size: 14px;
				line-height: 24px;
				margin-right: 6px;
			}
			>div.desc {
				margin-top: 20px;
			}
			.close-btn {
				color: #fff;
				border-color: #FA6E86;
				background: #FA6E86;
			}
			.open-btn {
				color: #fff;
				border-color: #47cb89;
				background: #47cb89;
			}
			.user {
				margin-top: 15px;
			}
		}
	}
</style>