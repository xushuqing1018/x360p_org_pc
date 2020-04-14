<template>
	<div class="padder-sm">
		<div class="box box-query mb-3">
			<Row>
				<Col span="24">
					<Button-group>
			            <Button size="small" :type="source_type===1?'primary':'ghost'" icon="document-text" @click="change_status(1)">图文</Button>
			            <Button size="small" :type="source_type===2?'primary':'ghost'" icon="image" @click="change_status(2)">图片</Button>
			            <Button size="small" :type="source_type===3?'primary':'ghost'" icon="mic-a" @click="change_status(3)">语音</Button>
			            <Button size="small" :type="source_type===4?'primary':'ghost'" icon="ios-videocam" @click="change_status(4)">视频</Button>
			        </Button-group>
			        <Button type="primary" class="ml-3" size="small" icon="ios-download-outline" @click="get_wx_files">同步微信</Button>
			        <!--<Button type="primary" size="small" icon="plus" @click="add">添加</Button>-->
				</Col>
			</Row>			
			<Row class="mt-3">
				<Col span="8">
					<date-range-picker 
						v-model="search_field.update_time" 
						@on-change="init_data"  
						label="更新日期" 
						placement="bottom" 
						size="small" 
						:transfer="true">
					</date-range-picker>
				</Col>
			</Row>
        </div>
        <div class="box box-result">     
        	<div class="content">
        		<div class="content-body">
		        	<!--图文-->        	
		        	<waterfall :line-gap="289" :watch="news_data" v-if="source_type===1">
					  <waterfall-slot
					    v-for="(item, index) in news_data"
					    :order="index"
					    :key="item.media_id"
					    :height="398+((item.items.length-1)*103)"
					    :width="289"
					    style="width:289px;"
					    v-if="item.items&&item.items.length>0"
					  >
					  	<div class="source-card-item">
				    			<div class="source-card-content">
									<div class="source-card-header">
										<span class="pull-left">{{item.update_time|format_time}}</span>
										<Icon class="pull-right" type="chatbubbles" size="20" color="#19be6b"></Icon>
										<div style="clear: both;"></div>
									</div>
									<div class="content-img-item">
										<h4 class="card-body-title">{{item.items[0].title}}</h4>
										<div class="card-body-image" :style="{backgroundImage:'url('+format_wx_img(item.items[0].thumb_url)+')'}"></div>
										<p class="card-body-desc">{{item.items[0].digest}}</p>
										<a target="_blank" :href="item.items[0].url" class="cover-dark">
											<div class="edit-mask-content">
												本地预览
												<Tooltip>
													<span slot="content">这是本地文章，不可以群发，<br>可以转换为微信文章</span>
													<Icon type="help-circled"></Icon>
												</Tooltip>
											</div>
											<span class="vm-box"></span>
										</a>
									</div>
									<div class="content-article-item" v-if="item.items.length>1&&articleIndex>0" v-for="(article,articleIndex) in item.items" :key="articleIndex">
										<div class="appmsg-thumb" :style="{backgroundImage:'url('+format_wx_img(article.thumb_url)+')'}"></div>
										<span class="card-body-title">{{article.title}}</span>
										<a target="_blank" :href="article.url" class="cover-dark">
											<div class="edit-mask-content">
												<p>预览文章</p>
											</div>
											<span class="vm-box"></span>
										</a>
									</div>
								</div>
								<div class="source-card-footer">
									<ul>
										<!--<li class="footer-icon-item" @click="group_wx">
											<a>
				    							<Tooltip content="群发" style="display: block;">
				    								<Icon type="paper-airplane" size="20"></Icon>
				    							</Tooltip>
											</a>
										</li>
										<li class="footer-icon-item">
											<a>
				    							<Tooltip content="编辑" style="display: block;">
				    								<Icon type="edit" size="20"></Icon>
				    							</Tooltip>
											</a>
										</li>-->
										<li class="footer-icon-item" @click="del(item)">
											<a>
				    							<Tooltip content="删除" style="display: block;">
				    								<Icon type="ios-trash" size="20"></Icon>
				    							</Tooltip>
				    						</a>
										</li>
									</ul>
								</div>
					    </div>
					  </waterfall-slot>
					</waterfall>
		        	        	
		        	<!--图片-->
		        	<ul class="source-img-list" v-if="source_type===2">
		        		<li class="source-img-item" v-for="(item,index) in image_data" :key="index">
		        			<div class="source-img-header">
		        				<Icon class="pull-right" type="chatbubbles" size="20" color="#19be6b"></Icon>
		        				<span class="pull-left source-img-title">{{item.name}}</span>
		        				<div style="clear: both;"></div>
		        			</div>
		        			<div class="source-img-content" @click="handleView(format_wx_img(item.url))">
		        				<img :src="format_wx_img(item.url)">
		        			</div>
		        			<div class="source-img-footer">
		        				<ul>
		        					<!--<li class="footer-icon-item" @click="group_wx">
		        						<a>
		        							<Tooltip content="群发" style="display: block;">
		        								<Icon type="paper-airplane" size="20"></Icon>
		        							</Tooltip>
		        						</a>
		        					</li>-->
		        					<li class="footer-icon-item" @click="del(item)">
		        						<a>
		        							<Tooltip content="删除" style="display: block;">
		        								<Icon type="ios-trash" size="20"></Icon>
		        							</Tooltip>
		        						</a>
		        					</li>
		        				</ul>
		        			</div>
		        		</li>
		        	</ul>
		        		   	
		        	<!--音频-->
		        	<ul class="source-audio-list" v-if="source_type===3">
		        		<li class="source-audio-item" v-for="(item,index) in voice_data" :key="index">
		        			<div class="source-audio-header">
		        				<Icon class="pull-right" type="chatbubbles" size="20" color="#19be6b"></Icon>
		        				<span class="pull-left source-img-title">{{item.update_time|format_time}}</span>
		        				<div style="clear: both;"></div>
		        			</div>
		        			<div class="source-audio-content">
		        				<div class="audio-icon-wrap">
		        					<playVoice class="icon-voice-msg" 
		        						:active="active_voice===index"
		        						@click.native="active_voice=index"
		        						:src="'http://qms.xiao360.com/api/open/wxvoice?media_id='+item.media_id"></playVoice>
		        				</div>
		        				<div class="audio-content">
		        					<p class="audio-title">{{item.name}}</p>
		        					<p class="audio-length">09:48</p>
		        				</div>
		        			</div>
		        			<div class="source-audio-footer">
		        				<ul>
		        					<!--<li class="footer-icon-item" @click="group_wx">
		        						<a>
		        							<Tooltip content="群发" style="display: block;">
		        								<Icon type="paper-airplane" size="20"></Icon>
		        							</Tooltip>
		        						</a>
		        					</li>-->
		        					<li class="footer-icon-item" @click="del(item)">
		        						<a>
		        							<Tooltip content="删除" style="display: block;">
		        								<Icon type="ios-trash" size="20"></Icon>
		        							</Tooltip>
		        						</a>
		        					</li>
		        				</ul>
		        			</div>
		        		</li>
		        	</ul>
					      	 
		        	<!--视频-->
		        	<ul class="source-video-list" v-if="source_type===4">
		        		<li class="source-img-item" v-for="(item,index) in video_data" :key="index">
		        			<div class="source-img-header">
		        				<Icon class="pull-right" type="chatbubbles" size="20" color="#19be6b"></Icon>
		        				<span class="pull-left source-img-title">{{item.name}}</span>
		        				<div style="clear: both;"></div>
		        			</div>
		        			<div class="source-img-content" @click="play_video(item)">        				
		        				<div class="source-video-cover">
		        					<Icon type="ios-videocam" size="50"></Icon>
		        				</div>
		        				<img src="http://omyc1h52u.bkt.clouddn.com/7205e7cd26829b83f49499dea2ad519b.mp4?vframe/jpg/offset/1/w/207/h/169">
		        			</div>
		        			<div class="source-img-footer">
		        				<ul>
		        					<!--<li class="footer-icon-item">
		        						<a>
		        							<Tooltip content="群发" style="display: block;">
		        								<Icon type="paper-airplane" size="20"></Icon>
		        							</Tooltip>
		        						</a>
		        					</li>-->
		        					<li class="footer-icon-item" @click="del(item)">
		        						<a>
		        							<Tooltip content="删除" style="display: block;">
		        								<Icon type="ios-trash" size="20"></Icon>
		        							</Tooltip>
		        						</a>
		        					</li>
		        				</ul>
		        			</div>
		        		</li>
		        	</ul>
		       		
        		</div>
	       		<div class="content-footer">
	                <div class="pagenation">
	                    <Page 
	                    	transfer
	                    	:total="total" 
	                    	:current="pageIndex" 
	                    	:show-sizer="true" 
	                    	:page-size="pageSize" 
	                    	:show-total="true" 
	                    	@on-change="pagenation" 
	                    	@on-page-size-change="pagesize">
	                    </Page>
	                </div>
	            </div>    
	       		<Spin class="spin-container" size="large" fix v-if="loading">
	                <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
	                <div>加载中...</div>
            	</Spin>
            </div>
        </div>
                	
        <!--播放视频-->
        <Modal v-model="modal_video" :mask-closable="false" title="播放视频" width="600">
        	<vue-video class="custom-video" v-if="modal_video" :sources="sources" :options="getVOptions(sources[0])" style="height:400px"></vue-video>
        </Modal>
                	
        <!--上传图片-->
        <Modal v-model="modal_upload" :mask-closable="false" title="上传图片" width="600">
        	<q-upload 	        			 
        	  :max="1"
        	  ref="qupload"
        	  :files="files"
			  title="视频上传" 
			  :getFiles="getFiles"
			  uploadingText="上传中..." 
			  domain="http://s10.xiao360.com" 
			  uptokenUrl="/api/upload"
			  :header="upload_header"
			  class="custom-video-upload">							
			</q-upload>
        	
        	<x-upload 
        		v-if="!uploadList.length"
		        multiple
		        type="drag"
		        :max-size="2048"
		        :headers="upload_header"
		        :data="upload_post"
		        :show-upload-list="false"
		        :on-success="hanlderSuccess"
		        :format="['jpg','jpeg','png']"
		        :on-format-error="handleFormatError"
		        :on-exceeded-size="handleMaxSize">
		        <div style="padding: 20px 0">
		            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
		            <p>点击或将文件拖拽到这里上传</p>
		        </div>
		    </x-upload>
		    <div class="" v-show="uploadList.length>0">
			    <div class="admin-upload-list" v-for="item in uploadList" :key="item.url">
	                <template v-if="item.status === 'finished'">
	                    <img :src="item.url">
	                    <div class="admin-upload-list-cover">
	                        <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
	                        <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
	                    </div>
	                </template>
	                <template v-else>
	                    <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
	                </template>
	            </div>
			    <x-upload
	                ref="upload"
	                multiple
	                type="drag"
	                :max-size="2048"	               
	                :headers="upload_header"
		        	:data="upload_post"
	                :show-upload-list="false"
	                :on-success="hanlderSuccess2"
	                :format="['jpg','jpeg','png']"
	                :on-format-error="handleFormatError"
	                :on-exceeded-size="handleMaxSize"
	                style="display: inline-block;width:58px;">
	                <div style="width: 58px;height:58px;line-height: 58px;">
	                    <Icon type="camera" size="20"></Icon>
	                </div>
	            </x-upload>
            </div>
            <div slot="footer">
            	<span class="pull-left">共选择{{uploadList.length}}张图片 ({{msg_img_size}}KB)</span>
            	<Button type="ghost" @click="modal_upload=false">取消</Button>
            	<Button type="primary" @click="modal_upload=false">确定</Button>
            </div>
        </Modal>
                	
        <!--查看图片-->
        <Modal title="查看图片" v-model="modal_preview" :mask-closable="false">
            <img :src="imgName" v-if="modal_preview" style="width: 100%">
            <div slot="footer">
            	<Button type="ghost" @click="modal_preview=false">关闭</Button>
            </div>
        </Modal>        
        	
        <!--群发-->
        <Modal v-model="modal_send" :mask-closable="false" title="选择群发的粉丝分组">
        	<Select v-model="group_value">
        		<Option :value="item.value" v-for="(item,index) in groups">
        			{{item.name}}
        			<span v-if="item.value>0">（{{item.nums}}）</span>
        		</Option>
        	</Select>
        	<div slot="footer">
        		<Button type="ghost" @click="modal_send=false">取消</Button>
        		<Button type="primary" @click="modal_send=false">发送</Button>
        	</div>
        </Modal>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import QUpload from 'c%/QUpload.vue'
	import vueVideo from 'c%/vueVideo.vue'
	import playVoice from 'c%/playVoice.vue'
	import Waterfall from 'vue-waterfall/lib/waterfall'
	import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import XUpload from 'c%/xupload/index'
	
	export default{
		mixins: [ grid,common ],
		components: {
			XUpload,
			QUpload,
			vueVideo,
			Waterfall,
			playVoice,
    		WaterfallSlot,
    		DateRangePicker
		},
		props: {
			appId: {
				type: [Number,String],
				default: () => {
					return 0 
				}
			}
		},
		data () {
			return {
				active_voice: -1,
				source_type: 1,
				modal_send: false,
				modal_video: false,
				modal_upload: false,
				modal_preview: false,
				group_value: null,
				loading: false,
				rest_api: 'wxmp_materials?type=news',
				pk: 'material_id',
				uploadList: [],
				news_data: [],
				image_data: [],
				voice_data: [],
				video_data: [],
				files: [],
				imgName: '',
				search_field:{
                    update_time: util.month_range()
                },
				groups: [
					{name: '全部粉丝',nums:0,value:-1},
					{name: '星标组',nums:9,value:2},
					{name: 'php',nums:1,value:100},
					{name: 'ui',nums:0,value:101},
				],
				sources: [{
					src: 'http://125.39.7.18/vweixinp.tc.qq.com/1007_a8e5faf4b42b4e6f8246570f5c43f482.f10.mp4?vkey=0B62697DBA6B65E78A0FA819D33A6022A47F0DE7D71C11F9583492EAA12099E2C08E3D36036C672A2EF3338F1A2FF2F86B7A0233386BABB1207C49B145C90163AC09E3CAD833C4360F0F4C5094E029162BD019D3DC6EA319&sha=0&save=1',//'http://omyc1h52u.bkt.clouddn.com/7205e7cd26829b83f49499dea2ad519b.mp4',
					size: 1371058,
					type: 'video/mp4',
				}],
			}
		},
		filters: {
			format_time (val) {
				return moment(val).format('YYYY年MM月DD')
			}
		},
		watch: {
			source_type: function (val) {
				let data = `${this.data_type}_data`
				this.pagenation(1)					
			},
			appId: function (val) {
				this.rest_api = `wxmp_materials?type=${this.data_type}&appid=${val}`
				this.init_data()
			}
		},
		computed: {			
			data_type () {
				let map = {1:'news',2:'image',3:'voice',4:'video'}
				return map[this.source_type]
			},
			upload_header () {
            	return {
                    'x-token':this.$store.state.user.token,
                    'x-file-key':'file'
                }
            },
            upload_post () {
                return {
                    mod:'wxmp_file'
                }
            },
            msg_img_size () {
            	let [uploadList,size] = [this.uploadList,0]
            	if(uploadList.length>0){
            		uploadList.forEach(u=>{
            			size += u.size
            		})
            		size = parseFloat(size/1000).toFixed(2)
            	}
            	return size
            },            
		},
		mounted () {
			this.uploadList = this.$refs['upload'].fileList
			this.init_data()
		},
		methods: {	
			del (item) {
				this.confirm('删除后将无法恢复，您确认要删除该素材吗？')
				.then(response=>{
					this.$http.delete('wxmp_materials/'+item.material_id)
					.then(response=>{
						this.init_data()
					},response=>{
						this.$Notice.error({
							title: '删除失败',
							desc: response.body.message||'删除失败,图片正在使用中！'
						})
					})
				})
			},
			group_wx () {
				this.modal_send = true
			},
			format_wx_img (src) {
				return this.$store.state.user.info.base_url+'/api/open/wximage?url='+src
			},
			get_wx_files () {
				this.showPageSpin()
				
				this.$http.get(`wxmp_materials/sync?appid=${this.appId}&type=${this.data_type}`)
				.then(response=>{
					this.init_data()
                    this.hidePageSpin()
				},response=>{
                    this.hidePageSpin()
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'同步微信出错~'
					})
				})
			},
			hook_get_param (params) {
				let type = this.data_type
				let data = `${type}_data`
				this.rest_api = `wxmp_materials?appid=${this.appId}&type=${type}`				
				params.update_time = util.get_date_query(util.copy(this.search_field.update_time))
				this.loading = true
			},
			dateChange(date_arr) {
	        	this.init_data()
	        },
			deal_data (data) {
				this.loading = false
				let type = this.data_type
				let data_name = `${type}_data`
				this[data_name] = data.list		
			},
			add () {
				this.modal_upload = true
			},
			play_video (item) {
				this.sources[0].src = item.url
				this.modal_video = true
			},
			change_status (val) {
				this.source_type = val	
			},
			getFiles (files) {
				console.log('files')
				console.log(files)
			},
			getVOptions (item){
				return {
					autoplay: false,
			        volume: 0.6,
			        poster: item.src+'?vframe/jpg/offset/1/w/300/h/200'				
				}
			},
			handleView (name) {
	            this.imgName = name;
	            this.modal_preview = true;
	        },
	        handleRemove (file) {
	            // 从 upload 实例删除数据
	            const fileList = this.$refs['upload'].fileList;
            	this.$refs['upload'].fileList.splice(fileList.indexOf(file), 1);
	        },
	        hanlderSuccess (res,file) {
	        	file.url = res.data.file_url
	        	this.uploadList.push(file)
	        },
	        hanlderSuccess2 (res,file) {
	        	file.url = res.data.file_url
	        },
	        handleFormatError (file) {
	            this.$Notice.warning({
	                title: '文件格式不正确',
	                desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
	            });
	        },
	        handleMaxSize (file) {
	            this.$Notice.warning({
	                title: '超出文件大小限制',
	                desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
	            });
	        },
		}
	}
</script>
