<style lang="less">
	.links-group {
		margin-left: 10px;
		label {
			margin-bottom: 0 !important;
		}
		&.ivu-radio-group {
			display: block;
			height: 400px;
			overflow: auto;
		}
	}
</style>
<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="550">
		<Tabs>
			<TabPane :label="system_links.pc.name" name="pc" v-if="showPane('pc')">
				<RadioGroup v-model="pcLink" vertical class="links-group">
					<Radio 
						v-for="item in system_links.pc.links" 
						:label="item.link"
						@click.prevent.native="pcLinkChange(item)">{{item.text}}
					</Radio>
				</RadioGroup>
			</TabPane>
			<TabPane :label="system_links.m.name" name="m" v-if="showPane('m')">
				<RadioGroup v-model="mLink" vertical class="links-group">
					<Radio 
						v-for="item in system_links.m.links" 
						:label="item.link"
						@click.prevent.native="mLinkChange(item)">{{item.text}}
					</Radio>
				</RadioGroup>
			</TabPane>
			<TabPane :label="system_links.student.name" name="student" v-if="showPane('student')">
				<RadioGroup v-model="studentLink" vertical class="links-group">
					<Radio 
						v-for="item in system_links.student.links" 
						:label="item.link"
						@click.prevent.native="sLinkChange(item)">{{item.text}}
					</Radio>
				</RadioGroup>
			</TabPane>
			<TabPane :label="system_links.bk.name" name="bk" v-if="showPane('bk')">
				<RadioGroup v-model="bkLink" vertical class="links-group">
					<Radio 
						v-for="item in system_links.bk.links" 
						:label="item.link"
						@click.prevent.native="bkLinkChange(item)">{{item.text}}
					</Radio>
				</RadioGroup>
			</TabPane>
		</Tabs>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		props: {
			forbidType: {
				type: Array,
				default(){
					return []
				}
			}
		},
		data() {
			return {
				pcLink: '',
				mLink: '',
				studentLink: '',
				bkLink: '',
				selectTab: ''
			}
		},
		computed: {
			system_links() {
				return this.$store.state.gvars.system_links
			}
		},
		methods: {
			showPane(tab) {
				let index = this.forbidType.indexOf(tab)
				if(index === -1) {
					return true
				}
				return false
			},
			pcLinkChange(item) {
				this.mLink = ''
				this.studentLink = ''
				this.bkLink = ''
				this.pcLink = item.link
				this.currentLinkObj = item
				this.selectTab = 'pc'
			},
			mLinkChange(item) {
				this.pcLink = ''
				this.studentLink = ''
				this.bkLink = ''
				this.mLink = item.link
				this.currentLinkObj = item
				this.selectTab = 'm'
			},
			sLinkChange(item) {
				this.pcLink = ''
				this.mLink = ''
				this.bkLink = ''
				this.studentLink = item.link
				this.currentLinkObj = item
				this.selectTab = 'student'
			},
			bkLinkChange(item) {
				this.pcLink = ''
				this.mLink = ''
				this.studentLink = ''
				this.bkLink = item.link
				this.currentLinkObj = item
				this.selectTab = 'bk'
			},
			ok() {
				let linkObj = this.currentLinkObj,
					link = '',
					baseUrl = this.$store.state.user.info.base_url

				if(_.isEmpty(linkObj)) {
					this.$Message.error('没有选中任何链接')
					return false;
				}
				if(this.selectTab === 'pc') {
					if(linkObj.type === 'modal') {
						link = linkObj.link
					}else if(linkObj.type === 'router') {
						link = util.sprintf('%s/#%s',baseUrl,linkObj.link)
					}
				}
				if(this.selectTab === 'm') {
					link = util.sprintf('%s/m/#%s',baseUrl,linkObj.link)
				}
				if(this.selectTab === 'student') {
					link = util.sprintf('%s/student/#%s',baseUrl,linkObj.link)
				}
				if(this.selectTab === 'bk') {
					link = util.sprintf('%s/bk/#%s',baseUrl,linkObj.link)
				}
				this.$emit('on-change',link)
				this.close()
			}
		}
	}
</script>