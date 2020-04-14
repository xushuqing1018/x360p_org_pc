<template>
	<Dropdown trigger="click">
		<slot>
			<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
		</slot>
		<DropdownMenu slot="list" style="max-width:100px;">
			<DropdownItem v-per="'franchsystem.edit'" @click.native="orgEdit" v-if="info.user">
				<Icon type="edit"></Icon>  编辑
			</DropdownItem>
			<DropdownItem v-per="'franchsystem.config'" @click.native="orgConfig" v-if="info.user">
				<Icon type="ios-gear"></Icon>  配置
			</DropdownItem>
			<!--<DropdownItem v-per="'franchsystem.renew'" @click.native="renew" v-if="info.is_frozen==0&&info.user">
				<Icon type="calendar"></Icon>  续费延期
			</DropdownItem> -->
			<DropdownItem v-per="'franchsystem.edit'" @click.native="switchType" v-if="info.user&&info.is_check==0">
				<Icon type="android-share"></Icon>
				<span v-if="info.org_type == 1">转换为督导版</span>
				<span v-if="info.org_type == 2">转换为正式版</span>
				<span></span>
			</DropdownItem>
			<DropdownItem @click.native="users_account" v-if="info.user">
				<Icon type="ios-people"></Icon>  员工账号
			</DropdownItem>
			<DropdownItem v-per="'franchsystem.lock'" @click.native="lock" v-if="info.is_frozen==0&&info.user">
				<Icon type="minus-circled"></Icon>  锁定账号
			</DropdownItem>
			<DropdownItem v-per="'franchsystem.unlock'" @click.native="unlock" v-if="info.is_frozen==1&&info.user">
				<Icon type="person-add"></Icon>  解锁账号
			</DropdownItem>
			<DropdownItem v-per="'franchsystem.reset'" @click.native="edit_account" v-if="info.is_frozen==0&&info.user">
				<Icon type="ios-refresh"></Icon>  修改账号
			</DropdownItem>
			<DropdownItem v-per="'franchsystem.check'" @click.native="systemCheck" v-if="info.is_check==1">
				<Icon type="checkmark"></Icon>  系统审核
			</DropdownItem>
			<DropdownItem v-per="'franchsystem.delete'" @click.native="del" v-if="info.user">
				<Icon type="ios-trash"></Icon>  删除
			</DropdownItem>
        </DropdownMenu>
	</Dropdown>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	export default{
		mixins: [common],
		props: {
			info: {
				type: Object,
				default() {
					return {}
				}
			}
		},
		data() {
			return {
				pk: 'og_id'
			}
		},
		methods: {
			systemCheck() {
				this.$Modal.open('app/franchisees/archive/check-modal.vue',{
					on: {
						save: () => {
							this.$emit('on-success')
						}
					},
					props: {
						itemInfo: this.info
					}
				})
				.then(modal => {
					modal
					.show('审核系统版本转换申请')
				})
			},
			switchType() {
				if(this.info.org_type == 1) {
					let label = '',
					type = 0;
					label = '督导沟通版';
					type = 2;
					this.$Modal.confirm({
						content:'确认转化为' + label,
						onOk:() => {
							this.$http.post(`orgs/${this.info.og_id}/change_org_type`,{
								org_type: type
							})
							.then(res => {
								this.$Message.success('转化成功')
								this.$emit('on-success')
							},res => {
								this.error(res.body.message)
							})
						}
					})

				}
				else {
					this.$Modal.open('app/franchisees/system/to-formal-modal.vue',{
						on: {
							save: () => {
								this.$emit('on-success')
							}
						}
					})
					.then(modal => {
						modal
						.set('og_id', this.info.og_id)
						.show('转换为正式版')
					})
				}
			},
			orgEdit() {
				let row = util.copy(this.info)
                let expire = row.expire_day
                if(expire!==0) {
                    row.expire_day = this.$filter('int_date')(expire)
                }
                delete row.create_time
                delete row.user

				this.$Modal.open('app/franchisees/system/info-modal.vue',{
					on: {
						save: () => {
							this.$emit('on-success')
						}
					},
					props: {
						edit: true
					}
				})
				.then(modal => {
					modal
					.set('info',{org:row})
					.show(util.sprintf('编辑校360系统【%s】',this.info.org_name),'edit')
				})
			},
			renew() {
				this.$Modal.open('system/orgs/renew.vue@modal',{
					on: {
						save: () => {
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					modal
					.set('info',this.info)
					.show(util.sprintf('续费延期:%s',this.info.org_name),'renew')
				})
			},
			orgConfig() {
				this.$Modal.open('system/orgs/config.vue@modal',{
					props: {
						id: this.info.og_id,
						name: this.info.org_name
					},
					on:{
						'success':() => {
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('系统配置【%s】',this.info.org_name))
				})
			},
			del() {
				this.confirm(util.sprintf('您确定要删除系统【%s】吗?',this.info.org_name))
                .then(()=>{
                    this.$rest('orgs')
                    .delete(this.info.og_id)
                    .success(res => {
                    	this.$Message.success('删除成功')
                    	this.$emit('on-success')
                    })
                    .error(res => {
                    	this.$Message.error(res.body.message)
                    })
                })   
			},
			users_account () {
				this.$Modal.open('system/orgs/org-users-modal.vue')
				.then(modal=>{
					modal
					.set('og_id',this.info.og_id)
					.show(`【${this.info.org_name}】员工账号`,'add')
				})
			},
			lock() {
				this.confirm(util.sprintf('您确定要锁定校360系统【%s】吗?',this.info.org_name))
				.then(()=>{
					this.$rest('orgs/'+this.info.og_id+'/dofreeze')
					.post()
					.success(response=>{
						this.$emit('on-success')
						this.$Message.success('锁定成功')
					})
					.error(response=>{
						this.$Message.error(response.body.message)
					})
				})
			},
			unlock() {
				this.confirm(util.sprintf('您确定要解锁校360系统【%s】吗?',this.info.org_name))
				.then(()=>{
					this.$rest('orgs/'+this.info.og_id+'/dounfreeze')
					.post()
					.success(response=>{
						this.$emit('on-success')
						this.$Message.success('解锁成功')
					})
					.error(response=>{
						this.$Message.error(response.body.message)
					})
				})
			},
			edit_account() {
				if(!this.info.user) {
					this.$Message.error('校360系统账号已被删除')
					return false;
				}
                let param = {
                    account: this.info.user.account,
                    password: ''
                }
				this.$Modal.open('system/staff/employee/account-modal.vue',{
					props: {
						'employee': util.copy(this.info.user),
						'mode': 'org'
					},
					on: {
						save: () => {
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					modal
					.set('info',param)
					.show(util.sprintf('修改账号:%s',this.info.org_name),'edit')
				})
			},
			systemReview() {
				this.$Modal.open('app/franchisees/system/info-modal.vue',{
					props: {
						franchisee: this.info,
						review: true,
						edit: true
					},
					on: {
						save: () => {
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('审核校360系统【%s】',this.info.org_name),'add')
				})
			}	
		}
	}
</script>

