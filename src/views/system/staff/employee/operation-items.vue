<template>
	<Dropdown trigger="click">
		<slot>
			<Button type="primary" size="small">操作  <Icon type="arrow-down-b"></Icon></Button>
		</slot>
		<DropdownMenu slot="list">
            <DropdownItem v-per="'employees.edit'" @click.native="edit">
            	<Icon type="edit"></Icon>　修改资料
            </DropdownItem>
            <DropdownItem v-per="'account.add'" @click.native="open_account" v-if="info.uid == 0">
            	<Icon type="person-add"></Icon>　开启账户
            </DropdownItem>
            <DropdownItem v-per="'account.reset'" @click.native="edit_account" v-else>
            	<Icon type="ios-refresh"></Icon>　修改账户
            </DropdownItem>
            <DropdownItem v-per="'account.lock'" @click.native="disable_account" v-if="info.uid != 0 && info.user_status != 0">
            	<Icon type="minus-circled"></Icon>　禁用账户
            </DropdownItem>
            <DropdownItem v-per="'account.add'" @click.native="active_account" v-if="info.uid != 0 && info.user_status == 0">
            	<Icon type="android-done"></Icon>　启用账户
            </DropdownItem>
        </DropdownMenu>
	</Dropdown>
</template>

<script>
	export default{
		name: 'operationItems',
		props: {
			info: {
				type: Object,
				default: function () {
					return {}
				}
			}
		},
		methods: {
			edit () {
				this.$emit('edit')
			},
			open_account () {
				this.$emit('open-account')
			},
			edit_account () {
				this.$emit('edit-account')
			},
			disable_account () {
				this.$emit('disable-account')
			},
			active_account () {
				this.$emit('active-account')
			}
		}
	}
</script>

