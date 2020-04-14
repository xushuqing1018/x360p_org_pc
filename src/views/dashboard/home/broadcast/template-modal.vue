<style scoped>
	.ivu-radio-group-button .ivu-radio-wrapper-checked {
		z-index: 0;
	}
	.ivu-input-group {
		top: 0;
	}
	.content {
		margin-top: 30px;
	}
</style>
<template>
	<Modal 
		v-drag-modal 
		:mask-closable="false" 
		width="810" 
		v-model="modal$.show" 
		:title="modal$.title" 
		class="template-modal"
		>
		<RadioGroup v-model="type" type="button" style="margin-bottom:10px;">
        <Radio label="system">系统模板</Radio>
        <Radio label="custom">自定义模板</Radio>
    </RadioGroup>
		<Row :gutter="16" v-if="type == 'custom'" style="margin-bottom:10px;">
        <Col span="8">
        	<Input  size="small" v-model="params.search_value">
            <Select v-model="params.search_field" slot="prepend" style="width: 80px;">
                <Option value="name">模板名称</Option>
            </Select>
            <Button-group  slot="append" style="width: 25px;">
                <Button  icon="ios-search"  @click="search" type="primary" size="small"></Button>
            </Button-group>
        	</Input>
        </Col>
        <Col span="2" style="padding-left:1px;">
					<Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
        </Col>
        <Col span="14">
        </Col>
    </Row>
		<div class="template-list" v-if="type == 'system'">
			<div class="template-item" v-for="item in data" :key="item.bt_id">
				<div class="img">
					<img :src="item.cover_image_url"/>
					<div class="mask">
						<div class="btns">
							<Button type="primary" @click="useNow(item)">立即使用</Button>
							<Button type="ghost" class="preview" @click="previewTpl(item)">预览模板</Button>
						</div>
					</div>
				</div>
				<div class="title">{{item.name}}</div>
			</div>
		</div>
		<div class="template-list" v-else >
			<div class="text-center" v-if="loading">正在加载数据...</div>
			<template v-else>		
				<div class="template-item" v-if="og_id$ === 0">
					<div class="img">
						<div class="mask" style="display:block;background:#fff">
							<div class="btns">
								<Icon type="plus" @click="add" :size=70 v-per="'template.add'"></Icon>
							</div>
						</div>
					</div>
					<div class="title">添加自定义模板</div>
				</div>
				<div class="template-item" v-for="item in data" :key="item.bt_id">
					<div class="img">
						<img :src="item.cover_image_url"/>
						<div class="mask">
							<div class="btns">
								<Button type="primary" @click="useNow(item)">立即使用</Button>
								<Button type="ghost" class="preview" @click="previewTpl(item)">预览模板</Button>
								<template v-if="og_id$ === 0">
								<Icon 
									type="edit"  
									@click="edit(item)" 
									:size=25 color="#ccc" 
									class="preview-icon"
									title="编辑模板"
									v-per="'template.edit'"

								>
									</Icon>
								<Icon 
									type="ios-trash"  
									@click="del(item)" 
									:size=30 color="#ccc" 
									class="preview-icon" 
									style="left:36px; top:12px;"
									title="删除模板"
									v-per="'template.delete'"
								>
								</Icon>
								</template>
							</div>
						</div>
					</div>
					<div class="title">{{item.name}}</div>
				</div>
			</template>
		</div>		
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
        <div class="modal-mask" v-if="preview">
        	<div class="preview-box">
        		<div class="content">
					<p class="header">{{currentItem.name}}</p>
					<p class="date">{{now_date}}</p>
					<p class="desc" v-html="currentItem.html"></p>
				</div>
        	</div>
        	<Icon type="close" @click.native="closePreview"></Icon>
        </div>
    </Modal>
</template>
<script>
	import moment from 'moment'
 	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'

	export default {
		mixins: [grid,modal,common],
		components: {
			
		},
		data() {
			return {
				rest_api: 'broadcast_tpls',
				data: [],
				preview: false,
				currentItem: null,
				type: 'system',
				now_date:moment().format('YYYY-MM-DD')
			}
		},
		mounted() {
			this.init_data()
		},
		watch: {
			'type': function(val) {
				if(val == 'system'){
					this.rest_api = 'broadcast_tpls'
					this.data = []
					this.init_data()
				}else {
					this.rest_api = 'broadcast_tpls/get_diy_tpls'
					this.data = []
					this.init_data()
				}
			}
		},
		methods: {
			useNow(item) {
				this.$emit('on-ok',item)
				this.close()
			},
			previewTpl(item) {
				this.preview = true
				this.currentItem = item
			},
			closePreview() {
				this.preview = false
			},
			hook_get_param(params) {
				params.pagesize = 100
			},
			add () {
				this.$Modal.open('dashboard/home/broadcast/template-info-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加模板', 'add')
				})
			},
			edit (item) {
				this.$Modal.open('dashboard/home/broadcast/template-info-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
						.set('info', item)
						.show(util.sprintf('编辑模板【&s】', item.name), 'edit')
				})
			},
			del (item) {
        this.confirm('您确定要删除公告模板【'+item.name+'】吗?')
        .then(()=>{
					let uri = `broadcast_tpls`, id = item.bt_id
					this.$rest(uri)
					.delete(id)
					.success((response) =>{
						this.$Message.success('删除成功')
						this.init_data()
					})
					.error((response) =>{
						this.error(response.body.message)
					})
        })				
			}
		}
	}
</script>
<style lang="less">
.template-modal{
	position:relative;
	.modal-mask {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: rgba(0,0,0,.4);
		.preview-box {
			position: absolute;
			top: 50%;
			left: 50%;
			margin-left: -160px;
			margin-top: -370px;
			width: 320px;
		    height: 100%;
		    background: url(http://sp1.xiao360.com/static/img/phone.png) no-repeat 50%;
		    background-size: 100%;
		    padding: 150px 28px 110px 28px;
		    .content {
		    	width: 100%;
		    	height: 475px;
		    	overflow: auto;
		    	&::-webkit-scrollbar{
		    		display: none;
		    	}
		    	*::-webkit-scrollbar{
		    		display: none;
		    	}
		    }
		    .header {
	    		font-size: 18px;
	    		font-weight: 600;
	    	}
	    	.date {
	    		font-size: 12px;
	    		color: #999;
	    	}
	    	.desc {
	    		p {
	    			white-space: normal !important;
	    			width: auto !important;
	    		}
	    		img {
	    			max-width: 100%;
	    		}
	    	}
		}
		.ivu-icon-close {
			position: absolute;
			font-size: 40px;
			top: 20px;
			left: 50%;
			margin-left: -15px;
			color: #fff;
		}
	}
}
.template-list {
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-start;
	height: 600px;
	overflow: auto;
	.template-item {
		width: 177px;
		height: 230px;
		box-shadow: 0 1px 2px rgba(0,0,0,.1);
		background: #fff;
		margin-right: 20px;
		margin-bottom: 30px;
		cursor: pointer;
		&:nth-child(4n) {
			margin-right: 0;
		}
		&:hover {
			.mask {
				display: block !important;
			}
		}
		.img {
			position: relative;
			width: 100%;
			height: 192px;
			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
			.mask {
				position: absolute;
				display: none;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				background: rgba(0,0,0,.6);
				.btns {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%,-50%);
					.preview-icon {
						position: relative;
						top: 10px;
						&:hover {
							color: #39f !important;
						}
					}
				}
				.preview {
					display: block;
					color: #fff;
					margin-top: 20px;
					&:hover {
						color: #39f;
					}
				}
			}
		}
		.title {
			font-size: 14px;
			color: #373737;
			padding: 10px 15px;
		}
	}
}
.ivu-input-group-append {
	background: #39f;
}
.ivu-input-group .ivu-input {
	z-index: 0;
}
</style>