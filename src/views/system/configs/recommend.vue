<template>
	<div>
		<div class="row">
			<div class="col-md-6 col-sm-12">
				<div class="rule-item mb-3">
					<img :src="config.banner" style="width:375px;height:190px">
					<div class="mt-2">
						<label class="text-desc">（建议上传750*380大小的图片）</label>
						<c-upload
						v-model="config.banner"
						btn-text="更换"
						>
						</c-upload>
					</div>
				</div>
				<div class="rule-item">
					<div class="mb-2">
						大标题： <Input style="width:280px" v-model="config.title" placeholder="请输入大标题"></Input>						
					</div>
				</div>
				<div class="rule-item" v-for="(item,index) in config.rules" :key="index">
					<div class="mb-2">
						标题： <Input style="width:280px" v-model="item.title" placeholder="请输入规则标题"></Input>						
					</div>
					<div class="">
						描述： <Input style="width:360px" type="textarea" :autosize="{minRows: 2,maxRows: 3}" v-model="item.desc" placeholder="请输入规则详情"></Input>
						
						<Button type="ghost" icon="ios-trash" class="pull-right" title="删除" @click="delRule(item)"></Button>							
					</div>
				</div>
				<div class="text-right mt-3">
					<Button type="ghost" icon="plus" @click="addRule">添加</Button>
				</div>
			</div>
			<div class="col-md-6 col-sm-12">
				<Card>
					<p slot="title">效果预览</p>
					<div class="x-container">
						<div class="x-banner" :style="{backgroundImage: 'url('+config.banner+')'}">
							
						</div>
						<div class="x-title">{{config.title}}</div>
						<div class="x-rules">
							<div class="x-rule-item" v-for="(item,index) in config.rules" :key="index">
								<div class="x-rule-title">{{item.title}}</div>
								<div class="x-rule-desc" v-html="nlbr(item.desc)"></div>								
							</div>
						</div>
						<div class="footer">
							<button class="x-btn">我要推荐</button>
							
							<div class="text-right mt-1">
								<span class="x-link">我的推荐</span>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
		
		<div class="mt-3 footer-btn" style="padding-left: 0;">
	        <Button type="primary" @click="save()">保存配置</Button>		        
		</div>  
	</div>
</template>

<script>
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import cUpload from 'c%/cUpload.vue'
	
	export default{
		mixins: [ common, config ],
		components: {
			cUpload
		},
		data () {
			return {
				info: '',
				cfg_name: 'recommend_rule',
				config: {
					banner: '/static/img/recommend-banner.png',
					rules: []
				}
			}
		},
		methods: {
			nlbr(val){
				return val.replace(/[\n\r]+/g,'<br>')
			},
			save () {
				if(!this.config.rules.length){
					this.$Message.error('请添加推荐规则')
					return
				}
				this.handleSubmit()
			},
			addRule () {
				this.config.rules.push({
					title: '奖励规则',
					desc: '规则描述'
				})
			},
			delRule (item) {
				let index = this.config.rules.indexOf(item)
				if(index > -1){
					this.config.rules.splice(index,1)
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.rule-item{
	    padding: 10px;
		border-bottom: 1px solid #e9eaec;	
	}
	.x-container{
		height: 667px;
		width: 375px;
		overflow-x: hidden;
		overflow-y: auto;
		background: #fff;
		.x-banner{
		    height: 190px;
		    background: url(/static/img/recommend-banner.png) no-repeat;
    		background-size: cover;
		}
		.x-title{
			color: #FF8C0F;
			font-size: 17px;
			text-align: center;
			padding: 23px 0;
		}
		.x-rules{
		    padding: 10px;
		    background: #fff;
		    color: #495060;
		    .x-rule-item{
		    	.x-rule-title{
		    		border-left: 3px solid #FF8C0F;
		    		font-size: 13px;
		    		color: #525252;
		    		padding-left: 10px;
		    	}
		    	.x-rule-desc{
		    		font-size: 12px;
		    		color: #AAAAAA;
	    		    padding: 10px 10px 10px 13px;
		    	}
		    }
		}	
		
		.footer{
			text-align: center;
			padding: 10px;
			.x-btn{
			    width: 100%;
			    background: #FF8C0F;
			    color: #fff;
			    font-size: 18px;
			    border: none;
			    border-radius: 7px;
			    height: 43px;
			    line-height: 43px;
			}
			.x-link{
				font-size: 13px;
				color: #FF8C0F;
			}
		}
	}
</style>