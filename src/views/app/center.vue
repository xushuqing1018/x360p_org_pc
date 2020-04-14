<template>
	<div class="c-grid" style="position: relative;">
		<div class="box">
			<div class="app-center-container">
				<div class="default-app">
					<div class="app-cate"><p>内置应用</p></div>
					<ul class="app-list">
						<li class="app-item" v-for="item in default_app" @click="get_info(item.app_id)">
							<div class="app-icon">
								<img :src="item.app_icon_uri"/>
								<span class="tag" v-if="item.action=='enable'">已启用</span>
							</div>
							<div class="app-desc">
								<h3>
									{{item.app_name}}
									<Button 
										class="pull-right" 
										:class="item.action=='enable'?'close-btn':'open-btn'" 
										type="ghost"
										@click.prevent.stop="doaction(item)"
										>
										{{item.action=='enable'?'关闭':'开启'}}
									</Button>
								</h3>
								<p>{{item.app_desc}}</p>
							</div>
						</li>
					</ul>
				</div>
				<div class="added-app">
					<div class="app-cate"><p>增值应用</p></div>
					<ul class="app-list">
						<li class="app-item" v-for="item in added_app" @click="get_info(item.app_id)">
							<div class="app-icon">
								<img :src="item.app_icon_uri"/>
							</div>
							<div class="app-desc">
								<h3>
									{{item.app_name}}
									<Button 
										class="pull-right open-btn" 
										type="ghost" 
										@click.prevent.stop="renewal"
										v-if="item.is_buy==0"
										>
										购买
									</Button>
									<Button 
										class="pull-right close-btn" 
										type="ghost" 
										@click.prevent.stop="renewal"
										v-else
										>
										续费
									</Button>
								</h3>
								<p>{{item.app_desc}}</p>
							</div>
						</li>
					</ul>
				</div>	
			</div>
		</div>
		<Spin size="large" fix v-if="loading"></Spin>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixin: [common,globals],
		data() {
			return {
				data: [],
				loading: false
			}
		},
		mounted() {
			this.get_app()
		},
		methods: {
			get_app() {
				this.loading = true
				this.$rest('apps')
				.get()
				.success(res => {
					this.data = res.list
					this.loading = false
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			doaction(item) {
				let message = item.action=='enable'?'禁用成功':'启用成功'
				this.$rest('apps')
				.post({
					app_ename: item.app_ename
				})
				.success(res => {
					this.$Message.success(message)
					this.getGlobalAll()
					this.get_app()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			get_info(id) {
				this.$router.push({path: '/app/center/'+id})
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
			},
			renewal() {
				this.$Message.info('请与您的销售经理联系购买!')
			}
		},
		computed: {
			default_app() {
				return this.data.filter(item => item.is_system==1)
			},
			added_app() {
				return this.data.filter(item => item.is_system==0)
			}
		}
	}
</script>
<style lang="less">
	.app-center-container {
		padding: 10px;
		.app-cate {
			height: 40px;
			line-height: 40px;
			position: relative;
			>p{
				width: 100px;
				height: inherit;
				line-height: inherit;
				font-size: 14px;
				text-align: center;
				color: #3399FF;
				border-bottom: 2px solid #3399FF;
				z-index: 3;
				position: relative;
			}
			&:after{
				content: '';
				display: block;
				position: absolute;
				bottom: 0;
				left: 0;
				background: #dcdee2;
				width: 100%;
				height: 1px;
			}
		}
		.app-list {
			display: flex;
			flex-wrap: wrap;
			padding-top: 30px;
			.app-item {
				width: 29%;
				display: flex;
				margin: 0 2% 30px;
				cursor: pointer;
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
					>p {
						margin-top: 20px;
					}
					.close-btn {
						color: #FA6E86;
						border-color: #FA6E86;
					}
					.open-btn {
						color: #47cb89;
						border-color: #47cb89;
					}
				}
			}
		}
	}
</style>