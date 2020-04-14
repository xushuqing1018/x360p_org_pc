<template>
	<Dropdown trigger="click" :transfer="true" :placement="placement">
		<slot>
			<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
		</slot>
		<DropdownMenu slot="list">
			<DropdownItem v-per="'francharchive.edit'" @click.native="edit">
				<Icon type="edit"></Icon>  编辑
			</DropdownItem>
			<DropdownItem v-per="'francharchive.contact'" @click.native="contact" v-if="!isDetail">
				<Icon type="android-contacts"></Icon>  联系人管理
			</DropdownItem>
			<DropdownItem v-per="'francharchive.contract'" @click.native="contract">
				<Icon type="android-contract"></Icon>  创建合同
			</DropdownItem>
			<DropdownItem v-per="'francharchive.open'" @click.native="open" v-if="info.fc_og_id==0&&info.is_sign!=0">
				<Icon type="android-open"></Icon>  开通校360系统
			</DropdownItem>
			<DropdownItem v-per="'francharchive.link'" @click.native="link" v-if="info.fc_og_id==0&&info.is_sign!=0">
				<Icon type="link"></Icon>  关联已有系统
			</DropdownItem>
			<DropdownItem v-per="'francharchive.link'" @click.native="unlink" v-if="info.fc_og_id>0">
				<Icon type="magnet"></Icon>  取消系统关联
			</DropdownItem>
			<DropdownItem v-per="'francharchive.service'" @click.native="service">
				<Icon type="crop"></Icon>  添加服务记录
			</DropdownItem>
			<DropdownItem v-per="'francharchive.delete'" @click.native="del" v-if="!isDetail">
				<Icon type="ios-trash"></Icon>  删除
			</DropdownItem>
        </DropdownMenu>
        <select-org ref="ref_org" v-model="link_org_id" v-show="false" @selected="linkOrgSystem"></select-org>
	</Dropdown>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import SelectOrg from 'c%/SelectOrg.vue'
	export default{
		mixins: [common],
		components: {
			SelectOrg
		},
		props: {
			placement: String,
			info: {
				type: Object,
				default() {
					return {}
				}
			},
			isDetail: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				pk: 'fc_id',
				link_org_id: 0
			}
		},
		methods: {
			edit() {
				this.$Modal.open('app/franchisees/archive/info-modal.vue',{
					on: {
						save:() => {
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					modal
					.set('info',this.info)
					.show(util.sprintf('编辑加盟商【%s】',this.info.org_name),'edit')
				})
			},
			contact() {
				this.$Modal.open('app/franchisees/archive/contact-list-modal.vue',{
					props: {
						franchisee: this.info
					}
				})
				.then(modal => {
					modal
					.show(util.sprintf('加盟商联系人【%s】',this.info.org_name))
				})
			},
			contract() {
				this.$Modal.open('app/franchisees/contract/info-modal.vue',{
					props: {
						'fc-id': this.info.fc_id
					},
					on: {
						save:() => {
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('创建合同【%s】',this.info.org_name),'add')
				})
			},
			open() {
				this.$Modal.open('app/franchisees/system/info-modal.vue',{
					props: {
						franchisee: this.info
					},
					on: {
						save: () => {
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('申请开通校360系统【%s】',this.info.org_name),'add')
				})
			},
			link() {
				this.$r('ref_org').openModal()
			},
			unlink() {
				this.confirm(util.sprintf('确定取消加盟商【%s】的已有校360系统关联吗？',this.info.org_name))
				.then(() => {
					this.$rest('franchisees')
					.add_url_param(this.info.fc_id,'docancel')
                    .post()
                    .success(res => {
                    	this.$Message.success('系统关联解除成功')
                    	this.$emit('on-success')
                    })
                    .error(res => {
                    	this.error(res.body.message)
                    })
				})
			},
			linkOrgSystem(selected) {
				if(selected.fc_id) {
					this.$Message.error(util.sprintf('校360系统【%s】已关联盟商资料',selected.org_name))
					return
				}
				this.$rest('franchisees').add_url_param(this.info.fc_id,'doconnect')
				.post({
					og_id: selected.og_id
				})
				.success(res => {
					this.$Message.success('关联成功')
					this.$emit('on-success')
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			service() {
				this.$Modal.open('app/franchisees/service/info-modal.vue',{
					props: {
						'fc-id': this.info.fc_id,
						'from': 'detail'
					}
				})
				.then(modal => {
					modal.show(util.sprintf('添加服务记录【%s】',this.info.org_name),'add')
				})
			},
			del() {
				this.confirm(util.sprintf('确定删除加盟商【%s】吗？',this.info.org_name))
				.then(() => {
					this.$rest('franchisees')
                    .delete(this.info.fc_id)
                    .success(res => {
                    	this.$Message.success('删除成功')
                    	this.$emit('on-success')
                    })
                    .error(res => {
                    	this.error(res.body.message)
                    })
				})
			}	
		}
	}
</script>

