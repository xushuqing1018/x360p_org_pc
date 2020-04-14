<template>
	<Modal v-drag-modal :mask-closable="false" width="500" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<Alert show-icon>
			{{student.student_name}}有欠交费用{{}}元，是否补交欠费？
			<template slot="desc">
				{{desc}}
			</template>
		</Alert>
		<div slot="footer">
            <Button type="ghost" size="small" @click="close">取消</Button>                                
            <Button type="primary" size="small" :loading="saving" @click="ok">确认</Button>                
        </div>
	</Modal>
</template>
<script>
	import modalMixin from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import $rest from '@/libs/rest'

	export default {
		name: 'ToFormal',
		mixins: [modalMixin,globals,grid,common],
		components: {
			
		},
		props: {
			student: {
				type: Object,
				default(){
					return {}
				}
			},
			info: {
				type: String,
				default: ''
			},
			desc: {
				type: String,
				defalut: ''
			}
		},
		data() {
			return {
				
			}
		},
		mounted() {

		},
		methods: {
			close() {
				this.modal$.show = false
			},
			ok() {
				this.$emit('on-ok')
			}
		},
		computed: {

		}
	}
</script>
<style lang="less" scoped>
	.info {
		margin-top: 10px;
		.name {
			display: inline-block;
			padding-left: 15px;
		}
		.tel {
			display: inline-block;
			padding-left: 15px;
		}
	}
	.sure {
		margin-top: 10px;
	}
</style>