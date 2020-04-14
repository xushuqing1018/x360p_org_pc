<template>
	<Modal v-drag-modal class="tpl-cate" :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900">
		<Row>
			<Col span="8">
				<div class="toolbar clear">
					<Button type="primary" size="small" @click="cateAdd" v-per="'comments.cate'">添加</Button>
					<div class="pull-right mr" v-if="data.length">
						<a @click="toggleEdit" style="font-size: 12px;">{{action=='edit'?'完成':'编辑'}}</a>
						<a @click="toggleDelete" style="font-size: 12px;">{{action=='delete'?'完成':'删除'}}</a>
					</div>
				</div>
				<Menu width="auto" ref="menu" mode="vertical" :active-name="activeName" @on-select="activeName=$event">
					<MenuItem :name="0">全部</MenuItem>
					<MenuItem :name="item.rtc_id" v-for="item in data">
						<div class="op-icon">
							<Icon type="edit" @click.native.stop="editCate(item)" v-if="action=='edit'"></Icon>
							<Icon type="close" @click.native.stop="deleteCate(item)" v-if="action=='delete'"></Icon>
						</div>
						{{item.name}}
					</MenuItem>
					
				</Menu>
			</Col>
			<Col span="16">
				<menu-item-table 
					class="mt-2" 
					:rtc-id="activeName" 
					:cates="data" 
					@on-select="selectRow"
					@on-modify-success="modifySuccess"
					>
				</menu-item-table>
			</Col>
		</Row>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import MenuItemTable from './tpl-cate-menu-table.vue'

	export default {
		mixins: [grid,modal,common,globals],
		props: {
			allowSelect: {
				type: Boolean,
				default: true
			}
		},
		components: {
			MenuItemTable
		},
		data() {
			return {
				action: 'list',
				activeName: 0,
				rest_api: 'review_tpl_cates?pagesize=100'
			}
		},
		mounted() {
			this.init_data()
		},
		computed: {
			
		},
		methods: {
			modifySuccess() {
				this.$emit('save')
			},
			init_cate() {
				this.$emit('on-init-cate')
				this.init_data()
			},
			cateAdd() {
				this.$Modal.open('system/configs/reviews-tpl/tpl-cate-info.vue@modal',{
					on: {
						'save':() => {
							this.init_cate()
						}
					}
				})
				.then(modal => {
					modal.show('添加模板分类','add')
				})
			},
			editCate(item) {
				this.$Modal.open('system/configs/reviews-tpl/tpl-cate-info.vue@modal',{
					on: {
						'save':() => {
							this.init_cate()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',item)
					.show('编辑模板分类:'+item.name,'edit')
				})
			},
			deleteCate(item) {
				this.confirm(util.sprintf('确定删除分类【%s】及所有绑定关系吗',item.name))
				.then(() => {
					this.$rest('review_tpl_cates')
					.delete(item.rtc_id)
					.success(res => {
						this.$Message.success('删除成功')
						this.init_cate()
						if(this.activeName > 0) {
							this.activeName = 0
							this.$nextTick(() => {
								this.$refs.menu.updateActiveName()
							})
						}
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			toggleEdit() {
				this.action == 'edit' ? this.action = 'list' : this.action = 'edit'
			},
			toggleDelete() {
				this.action == 'delete' ? this.action = 'list' : this.action = 'delete'
			},
			selectRow(row) {
				if(this.allowSelect) {
					this.$emit('on-click',row)
					this.close()
				}
			}
		}
	}
</script>
<style lang="less">
.tpl-cate {
	.toolbar{
		padding-bottom:5px;
		border-bottom:1px solid #ccc;
	}
	.mr{
		margin-right:5px;
	}
	.ivu-menu-horizontal {
		height: 30px;
		line-height: 30px;
	}
	.ivu-menu-item {
		position: relative;
		padding: 0 5px;
		.op-icon {
			width: 18px;
		    height: 18px;
		    position: absolute;
		    top: 0;
		    right: 0;
		    border-radius: 50%;
		    font-size: 11px;
		    z-index: 1;
		    line-height: 18px;
		    text-align: center;
		    i {
		    	cursor: pointer;

		    }
		}
	}
}
</style>