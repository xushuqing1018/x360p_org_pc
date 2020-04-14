<template>
	<div>
		<Row>
    		<Col span="8">
    			<Input 
    				v-model="search_field.file_name" 
    				placeholder="请输入文件名搜索" 
    				size="small" 
    				icon="ios-search" 
    				v-focusme="'searchkey'">
				</Input>
    		</Col>
    		<Col span="16">                			
    			<Button class="ml-2" type="primary" icon="ios-search" size="small" @click="search">查询</Button>
                <Button type="primary" icon="refresh" size="small" @click="resetSearch">重置</Button>	
    		</Col>
    	</Row>
    	<div class="file-pic-list">
    		<div 
    			:class="['file-box',{'select': item.$selected},{'page-box': pageSize > 8}]" 
    			@click="toggleSelected(item)" 
    			v-for="(item,index) in data"
				:key="index">
    			<div :class="['picture',{'page-pic': pageSize > 8}]">
	    			<img :src="item.file_url+'?vframe/jpg/offset/1/w/100/h/100'">
	    			<Icon type="ios-videocam" size="50" @click.native="toggleSelected(item)"></Icon>
	    		</div>
    			<Dropdown placement="bottom-end">
    				<a href="javascript:void(0)">
			            <Icon type="arrow-down-b" size="16"></Icon>
			        </a>
    				<DropdownMenu slot="list">
    					<DropdownItem @click.native.stop="preview(item)">播放视频</DropdownItem>
						<DropdownItem v-if="!item.file_name" @click.native.stop="addFileName(item)">添加文件名</DropdownItem>
						<DropdownItem v-else @click.native.stop="editFileName(item)">修改文件名</DropdownItem>
						<DropdownItem @click.native.stop="editFileUrl(item)">修改文件URL</DropdownItem>
						<DropdownItem @click.native.stop="delFile(item)">删除文件</DropdownItem>
    				</DropdownMenu>
    			</Dropdown>
    			<div class="file-name">
	    			<span v-if="item.file_name">{{item.file_name}}&nbsp;</span>
	    			<i class="fa fa-weixin" style="color:#2b85e4" v-if="item.openid"></i>
	    			<div>{{item.duration|duration}}</div>
	    		</div>
	    		
    			<Icon type="ios-checkmark" size="20"></Icon>
    		</div>
    		<div :class="['file-empty',{'page-empty': pageSize > 8}]" v-for="item in maxEmpty" v-if="data.length > 0"></div>
    	</div>
    	<div class="no-files" v-if="data.length == 0">没有数据</div>
    	<div class="file-pagenation">
            <Page 
	            :total="total" 
	            :current="pageIndex" 
	            :show-total="true" 
	            :page-size="pageSize"
	            @on-change="pagenation" 
	            >
            </Page>
       </div>
        <info-name ref="info_name" @save="init_data"></info-name>
		<file-url ref="file_url" @save="init_data"></file-url>
        <video-preview ref="videoPreview"></video-preview>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import directive from '@/libs/directive.mixin'
	import grid from '@/libs/grid.mixin'
	import file from './file.mixin'
	import VueVideo from 'c%/vueVideo.vue'
	import InfoName from './info-name.vue'
	import fileUrl from './file-url.vue'
	import VideoPreview from 'c%/VideoPreview.vue'
	
	const resName   = 'file'
	const idField   = 'file_id'
	const textField = 'file_name'

	export default {
		mixins: [ directive,grid,file ],
		components: {
			VueVideo,
			InfoName,
			fileUrl,
			VideoPreview
		},
		props: {
			selVideo: {
				type: Array,
				default() {
					return []
				}
			},
			multiple: {
				type: Boolean,
				default: false
			},
			size: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				rest_api: 'files?media_type=video',
				pageSize: this.size || 8,
				search_field: {
					file_name: ''
				}
			}
		},
		watch: {
			selVideo: function (val) {
				this.refreshData(this.data)
			}
		},
		mounted() {
			this.init_data()	
		},
		computed: {
			maxEmpty() {
				return this.pageSize > 8 ? 24 : 3
			}
		},
		methods: {
			addSelectedId(id) {
				if(this.selVideo.indexOf(id) === -1) {
					this.selVideo.push(id)
					this.refreshData(this.data)
				}
			},
			removeSelectedId(id) {
				let index = this.selVideo.indexOf(id)
	            if(index !== -1){
	                this.selVideo.splice(index,1)
	                this.refreshData(this.data)
	            }
			},
			replaceSelectedId(id){
	           if(this.selVideo.length == 0){
	                this.selVideo.push(id)
	            }else{
	                this.selVideo.splice(0,1,id)
	            }
	        },
			refreshData(data) {
				data.forEach((item) => {
					if(this.selVideo.indexOf(item[idField]) !== -1) {
						item.$selected = true
					} else {
						item.$selected = false
					}
				})
			},
			preview(item) {
				this.$refs.videoPreview
				.set('video',item)
				.show('播放视频')
			}
		}
	}
</script>
<style lang="less">
	.file-wrap {
		position: relative;
		margin-top: 24px;
		text-align: center;
		overflow: hidden;
		>.ivu-icon{
			position: absolute;
			top: 0;
			right: 45px;
		}
		.ivu-icon-ios-videocam {
			position: absolute;
			top: 50px;
			left: 50px;
      		transform: translateY(-50%);
      		color: #fff;
      		opacity: 0.7;
		}
		img {
			cursor: pointer;
			border: 2px solid #fff;
			&:hover {
				border: 2px solid #2b85e4;
			}
		}
		.voice-wrap {
			display: inline-block;
			cursor: pointer;
			&:hover {
				border: 1px solid #2b85e4;
			}
		}
	}
	.file-name {
		margin-top: 5px;
		word-wrap: break-word;
	}
	.file-pagenation {
		float: right;
		margin-top:20px;
		margin-bottom:10px;
	}
	.no-files {
		text-align: center;
		padding-top: 20px;
	}
</style>