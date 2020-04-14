<template>
	<div>
		<div class="row m-0">
			<div :class="tab=='pc'&&tab_pc!=='login'?'col-md-12':'col-md-7'">
				<Tabs v-model="tab">
					<TabPane label="PC端设置" name="pc">
						<Tabs type="card" v-model="tab_pc">
							<TabPane label="系统界面" name="login">
								<tab-pc :info="info.pc" @on-save="handleSubmit"></tab-pc>
							</TabPane>
							<TabPane label="快捷菜单" name="fast_menu">
								<pc-fast v-if="tab_pc=='fast_menu'"></pc-fast>
							</TabPane>
							<TabPane label="功能菜单" name="main_menu">
								<pc-menu v-if="tab_pc=='main_menu'"></pc-menu>
							</TabPane>
							<TabPane label="服务工作台" name="db_service" v-if="is_sdb_open">
								<db-service v-if="tab_pc=='db_service'"></db-service>
							</TabPane>
						</Tabs>
					</TabPane>
					<TabPane label="学习管家设置" name="mobile">
						<Tabs type="card" v-model="tab_mobile" v-if="tab=='mobile'">
							<TabPane label="登录界面" name="login">
								<tab-mobile :info="info.mobile" @on-save="handleSubmit"></tab-mobile>
							</TabPane>
                            <TabPane label="轮播图设置" name="banner">
								<student-mobile-banner v-if="tab_mobile=='banner'"></student-mobile-banner>
							</TabPane>
							<TabPane label="底部菜单" name="tab_bar">
								<student-mobile-tabbar v-if="tab_mobile=='tab_bar'" @on-change="studentConfigChange"></student-mobile-tabbar>
							</TabPane>
							<TabPane label="内部菜单" name="inner_menu">
								<student-mobile-menu v-if="tab_mobile=='inner_menu'" @on-select="tabChange" @on-change="studentConfigChange"></student-mobile-menu>
							</TabPane>
							<TabPane label="其他" name="inner_other">
								<student-mobile-other :info="info.mobile" v-if="tab_mobile=='inner_other'"></student-mobile-other>
							</TabPane>
						</Tabs>
					</TabPane>
					<TabPane label="教育助手设置" name="org">
						<Tabs type="card" v-model="tab_org" v-if="tab=='org'">
							<TabPane label="首页菜单" name="home_menu">
								<org-mobile-menu v-if="tab_org=='home_menu'" @on-change="orgConfigChange"></org-mobile-menu>
							</TabPane>
							<TabPane label="底部菜单" name="tab_bar">
								<org-mobile-tabbar v-if="tab_org=='tab_bar'" @on-change="orgConfigChange"></org-mobile-tabbar>
							</TabPane>
							<TabPane label="我的" name="mine_menu">
								<org-mobile-mine v-if="tab_org=='mine_menu'" @on-change="orgConfigChange"></org-mobile-mine>
							</TabPane>
						</Tabs>
					</TabPane>
				</Tabs>
			</div>
			<div class="col-md-5" v-if="showPreview">
				<Card dis-hover style="height:100%">
					<span slot="title">预览</span>
					<div class="login-contanier">
						<template v-if="tab=='pc'">
							<preview-pc :info="info.pc" v-if="tab_pc=='login'"></preview-pc>
						</template>
						<template v-if="tab=='mobile'">
							<preview-mobile :info="info.mobile" v-if="tab_mobile=='login'"></preview-mobile>
							<preview-student-tabbar :data="student_preview_data" v-if="tab_mobile=='tab_bar'"></preview-student-tabbar>
							<preview-student-menu ref="student_menu" :data="student_preview_data" v-if="tab_mobile=='inner_menu'"></preview-student-menu>
						</template>
						<template v-if="tab=='org'">
							<preview-org-menu :data="org_preview_data" v-if="tab_org=='home_menu'||tab_org=='tab_bar'"></preview-org-menu>
							<preview-org-mine :data="org_preview_data" v-if="tab_org=='mine_menu'"></preview-org-mine>
						</template>
					</div>
				</Card>
			</div>
		</div>
	</div>
</template>

<script>
	import {_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import tabPc from './ui/tab-pc.vue'
	import tabMobile from './ui/tab-mobile.vue'
	import previewPc from './ui/preview-pc.vue'
	import previewMobile from './ui/preview-mobile.vue'	
	import StudentMobileMenu from './ui/menu/student-menu.vue'
	import StudentMobileTabbar from './ui/menu/student-tabbar.vue'
	import PreviewStudentMenu from './ui/menu/preview-student-menu.vue'
	import PreviewStudentTabbar from './ui/menu/preview-student-tabbar.vue'
	import OrgMobileMenu from './ui/menu/org-menu.vue'
	import PreviewOrgMenu from './ui/menu/preview-org-menu.vue'
	import pcMenu from './ui/menu/pc-menu.vue'
	import pcFast from './ui/menu/pc-fast.vue'
	import Clipboard from 'clipboard'
	import OrgMobileMine from './ui/menu/org-mine.vue'
	import PreviewOrgMine from './ui/menu/preview-org-mine.vue'
	import DbService from './ui/menu/db-service.vue'
	import StudentMobileOther from './ui/menu/student-other.vue'
    import OrgMobileTabbar from './ui/menu/org-tabbar.vue'
    import StudentMobileBanner from './ui/menu/student-banner.vue'
	
	var clipboard = null
	
	export default{
		mixins:[globals,common],
		components: {
			tabPc,
			pcMenu,
			pcFast,
			tabMobile,
			previewPc,
			previewMobile,
			StudentMobileMenu,
			StudentMobileTabbar,
			PreviewStudentMenu,
			PreviewStudentTabbar,
			OrgMobileMenu,
			PreviewOrgMenu,
			OrgMobileMine,
			PreviewOrgMine,
			DbService,
			StudentMobileOther,
            OrgMobileTabbar,
            StudentMobileBanner
		},
		data () {
			return {
				tab: 'pc',
				tab_pc: 'login',
				tab_mobile: 'login',
				tab_org: 'home_menu',
				student_preview_data: {},
				org_preview_data: {}
			}
		},
		mounted () {		
			//dom加载完毕后绑定事件
			clipboard = new Clipboard('.copy-btn')
			clipboard.on('success', (e)=> {
			    this.$Message.success('复制成功！')			
			    e.clearSelection()
			})
		},
		destroyed () {			
			//离开页面时销毁
			clipboard.destroy()
		},
		computed: {
			info () {
				let client = this.$store.state.client,
					result = client.params
					
				return result
			},
			showPreview() {
				return this.tab == 'org' || this.tab == 'mobile' || (this.tab == 'pc' && this.tab_pc == 'login')
			}
		},
		methods: {
			handleSubmit () {				
				let [method,uri] = (this.action==='add'?['post','configs/edit_center_params']:['put','configs/edit_center_params'])
				
				let params = {
					cid: this.$store.state.client.cid,
					params: {}
				}
				params.params[this.tab] = this.info[this.tab]
				
				this.$http[method](uri,params)
				.then((response)=>{
					let user = {
						client: {
							params: this.info
						}
					}
					this.$Message.success('保存成功!')
					this.$store.commit('updateUserInfo',{user:user,action:'changeUI'})
					
				},(response)=>{
					this.error(response.message)
				})
			},
			tabChange(v) {
				this.$refs.student_menu.current_bar = v
			},
			studentConfigChange(data) {
				this.student_preview_data = data
			},
			orgConfigChange({config,rid,rids}) {
				this.org_preview_data = {
					config:config,
					rid:rid,
					rids:rids
				}
			}
		}
	}
</script>

<style>
</style>