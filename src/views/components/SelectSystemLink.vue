<template>
	<div class="system-link-wrapper">
		<Input v-model="model" :size="size" @on-change="handleChange" placeholder="请输入链接或选择系统链接">
			<Button slot="append" @click="selectFromModal" style="width: 70px">系统链接</Button>
		</Input>
	</div>
</template>
<script>
	export default {
		props: {
			forbidType: {
				type: Array,
				default(){
					return []
				}
			},
			value: {
				type: String,
				default: ''
			},
			size: {
				type: String,
				default: 'default'
			}
		},
		data() {
			return {
				model: this.value
			}
		},
		methods: {
			handleChange(e) {
				this.$emit('input',e.target.value)
			},
			selectFromModal() {
				this.$Modal.open('components/SelectSystemLinkModal.vue@modal',{
					props: {
						'forbid-type': this.forbidType
					},
					on: {
						'on-change': (link) => {
							this.model = link
							this.$emit('input',link)
						}
					}
				})
				.then(modal => {
					modal.show('选择系统链接')
				})
			}
		},
		watch: {
			value(val) {
				this.model = val
			}
		}
	}
</script>
