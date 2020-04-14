<template>
	<Modal v-drag-modal :mask-closable="false" width="900" v-model="modal$.show" :title="modal$.title">
		<Row :gutter="10" class="cast-detail">
			<Col span="9">
				<Card dis-hover>
					<div slot="title">推送记录<Badge :count="info.broadcast_push.length"></Badge></div>
					<div class="push-list" :class="{'empty':info.broadcast_push.length==0}">
						<div class="push-item" v-for="item in info.broadcast_push">
							<p class="name">{{getName(item)}}</p>
							<p class="read" :class="item.read_time?'text-gray':'text-danger'">
								{{item.read_time?item.read_time+' 已读':'未读'}}
							</p>
						</div>
					</div>
				</Card>
			</Col>
			<Col span="15" >
				<Card dis-hover class="content" v-if="edit">
					<div slot="title">发送内容</div>
					<div slot="extra" v-if="info.bc_type != 3">
						<Button type="ghost" size="small" @click="broadTemplate">模板库</Button>
					</div>
					<div class="title">
						<label>标题</label>
						<Input v-model="info.title"></Input>
					</div>
					<div v-if="info.bc_type != 3">
						<label>正文</label>
						<div class="ueditor">
							<umeditor v-model="info.desc" :config="{autoHeightEnabled:false,initialFrameHeight:318}"></umeditor>
						</div>
					</div>
                    <div v-if="info.bc_type == 3" class="title">
						<label>有效期</label>
						<div>
							<date-range-picker 
							    v-model="in_time"
							    label="选择日期" 
							    placement="bottom"
							    style="width:100%">
						    </date-range-picker>
						</div>
					</div>
                    <div v-if="info.bc_type == 2 || info.bc_type == 3">
                        <review-upload ref="upload" :hideOptions="info.broadcast_file.length == 1 && info.bc_type == 3" v-model="info.broadcast_file"></review-upload>
                    </div>
                    <div v-if="info.bc_type == 1">
						<label>封面图</label>
                        <div class="img-upload img-upload-full">
							<div class="img-thumb" style="width:110px !important;height:110px;line-height: 110px;display: inline-block;">
								<Icon type="camera" size="30" v-if="info.cover_img_url == ''" style="line-height: inherit;"></Icon>
								<img :src="info.cover_img_url" @click="picturePreview(info.cover_img_url)" v-else>
							</div>
                            <div style="display: inline-block;position: relative;top: 35px;">
							    <p>图片大小建议(110px*110px)</p>
                                <c-upload
						        	v-model="info.cover_img_url"
						        	btn-text="上传"
						        >
						        </c-upload>
                            </div>
						</div>
                    </div>
				</Card>
				<div class="view-box" v-else>
					<div class="content">
						<p class="header">{{info.title}}</p>
						<p class="date">{{info.create_time}}</p>
						<p class="desc" v-html="info.desc"></p>
                        <file-item :list="info.broadcast_file" v-if="info.broadcast_file.length > 0"></file-item>
					</div>
				</div>
			</Col>
			<div class="edit-btn" @click="toggleAction">{{edit?'返回':'编辑'}}</div>
		</Row>
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="ok" v-if="edit">确定</Button>
        </div>
    </Modal>
</template>
<script>
 	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
    import Umeditor from 'c%/Umeditor'
    import reviewUpload from 'c%/reviewUpload.vue'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import FileItem from 'c%/FileItem.vue'
    import cUpload from 'c%/cUpload.vue'

	export default {
		mixins: [modal,common,globals],
		props: {
			item:{
                type:Object,
                default:()=>{
                    return {}
                }
            }
		},
		components: {
            Umeditor,
            reviewUpload,
            DateRangePicker,
            FileItem,
            cUpload
		},
		data() {
			return {
				info: {
                    broadcast_push:[],
                    broadcast_file:[]
                },
                edit: false,
                in_time:[]
			}
		},
		mounted() {
            this.info = this.item
            if(this.info.bc_type == 3){
                this.in_time = [
                    this.$filter('int_date')(this.info.start_int_day),
                    this.$filter('int_date')(this.info.end_int_day) 
                ]
            }
		},
		methods: {
			broadTemplate() {
				this.$Modal.open('dashboard/home/broadcast/template-modal.vue',{
					on: {
						'on-ok':(data) => {
							this.info.title = data.name
							this.info.desc = data.html
						}
					}
				})
				.then(modal => {
					modal.show('选择模板')
				})
			},
			toggleAction() {
				this.edit = !this.edit
			},
			getName(item) {
				if(this.info.type==1) {
					return this.$filter('ename')(item.eid,'-')
				}else{
					if(item.student) {
						return item.student.student_name
					}
				}
				return '-'
			},
			ok() {
				if(this.info.title == '') {
					this.$Message.error('标题不能为空')
					return false
				}
				if(this.info.desc == '' && this.info.bc_type != 3) {
					this.$Message.error('内容不能为空')
					return false
				}
                let info = util.copy(this.info)
                
                if(info.bc_type == 2 && info.broadcast_file.length == 0){
                    this.$Message.error('请上传视频')
					return false
                }

                if(info.bc_type == 3){
                    if(info.broadcast_file.length == 0){
                        this.$Message.error('请上传语音')
					    return false
                    }
                    if(this.in_time.length == 0){
                        this.$Message.error('请选择有效期')
					    return false
                    }
                    info.start_int_day = this.$filter('format_int_day')(this.in_time[0])
                    info.end_int_day = this.$filter('format_int_day')(this.in_time[1])
                }

				delete info.broadcast_push
				this.$rest('broadcasts').add_url_param(this.info.bc_id)
				.put(info)
				.success(res => {
					this.$Message.success('公告编辑成功')
					this.$emit('save')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		},
		computed: {

		}
	}
</script>
<style lang="less">
	.cast-detail {
		position: relative;
		.edit-btn {
			position: absolute;
			right: 0;
			top: 50%;
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background: #faad14;
			margin-top: -30px;
		    text-align: center;
		    line-height: 40px;
		    opacity: 0.8;
		    color: #fff;
		    z-index: 10000;
		    cursor: pointer;
		}
		.push-list {
			height: 470px;
			overflow: auto;
			.push-item {
				position: relative;
				height: 32px;
				line-height: 32px;
				font-size: 12px;
				padding-left: 10px;
				padding-right: 10px;
				>p {
					display: inline;
				}
				.read {
					float: right;
				}
				&:after{
					content: ' ';
					display: block;
					position: absolute;
					left: 1px;
					right: 0;
					bottom: 0;
					border-bottom: 1px solid #ebedf0;
					transform: scaleY(0.5);
				}
			}
			&.empty {
			    background: url(http://s1.xiao360.com/nothing-notice.png) no-repeat 50%;
    			background-size: 20%;
			}
		}
		.view-box {
			width: 300px;
		    height: 540px;
		    background: url(http://sp1.xiao360.com/static/img/phone.png) no-repeat 50%;
		    background-size: 100%;
		    position: relative;
		    margin: 0 auto;
		    .content {
		    	position: absolute;
		    	top: 50px;
		    	left: 20px;
		    	width: 262px;
		    	height: 460px;
		    	padding: 10px;
		    	overflow: auto;
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
		    	&::-webkit-scrollbar{
		    		display: none;
		    	}
		    }
		}
		.content {
			.title {
				margin-bottom: 10px;
			}
			label {
				margin-bottom: 6px;
				font-size: 12px;
			}
			.ivu-card-extra {
				top: 10px;
			}
		}
		.ueditor {
			.edui-container {
				box-shadow: none;
				border: 1px solid #e3e8ee;
			}
			.edui-container .edui-toolbar {
				box-shadow: none;
				border-bottom: 1px solid #e3e8ee;
			}
		}
	}
</style>