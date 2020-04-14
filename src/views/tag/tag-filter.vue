<template>
	<div style="display: inline-block;">
		<Checkbox 
	    	v-model="showFilterByTag" 
	    	:style="{color:tagCurrent.tag_id?tagCurrent.color:'#657180'}"
	    	@on-change="changeFilterStatus"
	    	>
	    	按{{tagCurrent.tag_id?tagCurrent.tag_name:'标签'}}筛选
	    </Checkbox>
		<div class="tag-filter" :class="{show:showFilterByTag}">
			<div class="tag-list">
				<span class="ivu-badge" v-for="item in data" style="margin: 0 10px 10px 0">
					<Tag 
						class="tag-item"
						:color="item.color" 
						:name="item.tag_id"
						@click="tagFilter(item)"
						>
						{{item.tag_name}}
					</Tag>
					<span class="ivu-badge-count cursor" @click="editTag(item)" v-if="edit">
						<Icon type="edit"></Icon>
					</span>
					<span class="ivu-badge-count" v-else>{{item.total}}</span>
				</span>
			</div>
			<div class="text-center" v-if="data.length==0">暂无标签</div>
			<div v-if="data.length">
				<Button type="text" size="small" @click="toggleAction">{{edit?'完成':'编辑'}}</Button>
			</div>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	export default {
		props: {
			tagType: Number
		},
		data() {
			return {
				data: [],
				edit: false,
				showFilterByTag: false,
				tagCurrent: {
					tag_id: 0
				}
			}
		},
		watch: {
			showFilterByTag(v) {
				v && this.getTags()
			}
		},
		methods: {
            changeFilterStatus (v) {
                if(!v&&this.tagCurrent.tag_id) {
                    this.tagCurrent.tag_id = 0
                    this.$emit('on-filter',0)
                }
            },
			toggleAction() {
				this.edit = !this.edit
			},
			getTags() {
				this.$rest('tags')
				.get({
					tag_type: this.tagType
				})
				.success(res => {
					this.data = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			tagFilter(item) {
				if(this.tagCurrent.tag_id == item.tag_id) {
                    this.tagCurrent.tag_id = 0
                }
                else {
                    this.tagCurrent = util.copy(item)
                }
				this.$emit('on-filter',this.tagCurrent.tag_id)
			},
			editTag(item) {
				this.$Modal.open('tag/info-modal.vue',{
					on: {
						'on-success':() => {
							this.getTags()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',item)
					.show(util.sprintf('编辑标签【%s】',item.tag_name))
				})
			}
		}
	}
</script>
<style lang="less">
	.tag-filter {
		position: fixed;
		top: 100px;
		right: 0;
		width: 350px;
		height: 220px;
		background: #ffffffe6;
		box-shadow: 0 1px 6px rgba(0,0,0,.2);
		z-index: 1000;
		padding: 10px;
		overflow: auto;
		transform: translateX(360px);
		transition: transform .2s ease-in-out;
		&.show {
			transform: translateX(0);
		}
		.tag-item {
		    height: 28px;
		    line-height: 28px;
		}
	}
</style>