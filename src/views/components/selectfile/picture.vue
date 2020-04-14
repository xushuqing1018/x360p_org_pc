<style lang="less">
	.file-pic-list {
		padding: 10px 20px 0 10px;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		align-items: flex-start;
		.file-box {
			position: relative;
			max-height: 170px;
			height: 155px;
			display: inline-block;
			width: 120px;
			border: 1px solid transparent;
			margin-right: 10px;
			margin-bottom: 10px;
			overflow: hidden;
			.picture,.voice {
				width: 110px;
				height: 110px;
				padding-left: 5px;
				padding-top: 5px;
				display: block;
				overflow: hidden;
				text-align: center;
				vertical-align: middle;
				> img {
					max-height: 100%;
					max-width: 100%;
					position: relative;
					top: 50%;
					transform: translateY(-50%);
				}
				&.page-pic {
					width: 150px;
					height: 150px;
				}
				&.voice-wrapper {
					height: 80px;
				}
				.ivu-icon-ios-videocam {
					position: absolute;
					top: 60px;
					left: 55px;
		      		margin-top: -25px;
    				margin-left: -18px;
		      		color: #fff;
		      		opacity: 0.7;
				}
			}
			.file-name {
				text-align: center;
				word-break: break-all;
				line-height: 1.5;
				padding-bottom: 5px;
			}
			.ivu-icon-ios-checkmark {
				display: none;
				position: absolute;
				left: 4px;
				top: 0px;
			}
			.ivu-dropdown {
				display: none;
				position: absolute;
				top: 0px;
				right: 6px;
			}
			&:hover {
				transition: transform 0.2s;
				background: #e5f3ff;
				border-color: transparent; 
				.ivu-icon-ios-checkmark {
					display: inline-block;
				}
				.ivu-dropdown {
					display: inline-block;
					a {
						color: #657180;
					}
					&:hover a {
						color: #39f;
						cursor: pointer;
					}
				}
			}
			&.select {
				transition: transform 0.2s;
    			background: #cce8ff;
    			border-color: #99d1ff;
    			.ivu-icon-ios-checkmark {
    				display: inline-block;
    				color: #19be6b;
				}
				.ivu-dropdown {
					display: inline-block;
					a {
						color: #39f;
					}
				}
			}
			&.page-box {
				max-height: 220px;
				height: 195px;
				width: 160px;
				margin-right: 20px;
				margin-bottom: 20px;
				.picture .ivu-icon-ios-videocam {
					top: 75px;
					left: 75px;
				}
			}
		}
		.file-empty {
		    width: 120px;
		    border: 1px solid transparent;
		    margin: 0;
		    margin-right: 10px;
		    margin-bottom: 10px;
		    visibility: hidden;
		    height: 0 !important;
		    &.page-empty {
		    	margin-right: 20px;
				margin-bottom: 20px;
				width: 160px;
		    }
		}
	}
</style>
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
    			v-for="(item,index1) in data"
				:key="index1"
				>
    			<div :class="['picture',{'page-pic': pageSize > 8}]">
    				<img :src="formatImage(item.file_url)" />
    			</div>
    			<Dropdown placement="bottom-end">
    				<a href="javascript:void(0)">
			            <Icon type="arrow-down-b" size="16"></Icon>
			        </a>
    				<DropdownMenu slot="list">
    					<DropdownItem @click.native.stop="preview(item)">预览图片</DropdownItem>
						<DropdownItem v-if="!item.file_name" @click.native.stop="addFileName(item)">添加文件名</DropdownItem>
						<DropdownItem v-else @click.native.stop="editFileName(item)">修改文件名</DropdownItem>
						<DropdownItem @click.native.stop="editFileUrl(item)">修改文件URL</DropdownItem>
						<DropdownItem @click.native.stop="delFile(item)">删除文件</DropdownItem>
    				</DropdownMenu>
    			</Dropdown>
    			<div class="file-name">
	    			<span>{{item.file_name}}&nbsp;</span>
	    			<i class="fa fa-weixin" style="color:#2b85e4" v-if="item.openid"></i>
	    		</div>
    			<Icon type="ios-checkmark" size="20"></Icon>
    		</div>
    		<div 
			:class="['file-empty',{'page-empty': pageSize > 8}]" 
			v-for="item in maxEmpty" 
			v-if="data.length > 0">
			</div>
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
        <picture-pre ref="ref_picture"></picture-pre>
	</div>
</template>
<script>
	import directive from '@/libs/directive.mixin'
	import grid from '@/libs/grid.mixin'
	import file from './file.mixin'
	import InfoName from './info-name.vue'
	import fileUrl from './file-url.vue'
	import PicturePre from 'c%/PicturePreview.vue'

	const resName   = 'file'
	const idField   = 'file_id'
	const textField = 'file_name'

	export default {
		mixins: [directive,grid,file],
		components: {
			InfoName,
			fileUrl,
			PicturePre
		},
		props: {
			selImg: {
				type:Array,
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
				rest_api: 'files?media_type=image',
				pageSize: this.size || 8
			}
		},
		watch: {
			selImg: function (val) {
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
				if(this.selImg.indexOf(id) === -1) {
					this.selImg.push(id)
					this.refreshData(this.data)
				}
			},
			removeSelectedId(id) {
				let index = this.selImg.indexOf(id)
	            if(index !== -1){
	                this.selImg.splice(index,1)
	                this.refreshData(this.data)
	            }
			},
			replaceSelectedId(id){
	           if(this.selImg.length == 0){
	                this.selImg.push(id)
	            }else{
	                this.selImg.splice(0,1,id)
	            }
	        },
			refreshData(data) {
				data.forEach((item) => {
					if(this.selImg.indexOf(item[idField]) !== -1) {
						item.$selected = true
					} else {
						item.$selected = false
					}
				})
			},
			preview(item) {
				this.$r('ref_picture')
				.set('imgSrc',item.file_url)
				.show('图片预览','preview')
			},
			formatImage(url) {
				return `${url}?imageView2/3/w/100/h/100`
			}
		}
	}
</script>