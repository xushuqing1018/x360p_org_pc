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
    			v-for="(item,index) in data">
    			<div :class="['picture','voice-wrapper',{'page-pic': pageSize > 8}]">
	    			<play-voice 
	    				:active="active_voice===index"
						@click.native.stop="active_voice=index"
						:src="item.file_url"
						>
					</play-voice>
				</div>
    			<Dropdown placement="bottom-end">
	    			<a href="javascript:void(0)">
			            <Icon type="arrow-down-b" size="16"></Icon>
			        </a>
					<DropdownMenu slot="list">
						<DropdownItem @click.native.stop="playVoice(index)">播放语音</DropdownItem>
						<DropdownItem v-if="!item.file_name" @click.native.stop="addFileName(item)">添加文件名</DropdownItem>
						<DropdownItem v-else @click.native.stop="editFileName(item)">修改文件名</DropdownItem>
						<DropdownItem @click.native.stop="delFile(item)">删除文件</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<div class="file-name">
	    			<span v-if="item.file_name">{{item.file_name}}&nbsp;</span>
	    			<i class="fa fa-weixin" style="color:#2b85e4" v-if="item.openid"></i>
	    			<div>时长{{item.duration|duration}}</div>
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
	</div>
</template>
<script>
	import directive from '@/libs/directive.mixin'
	import grid from '@/libs/grid.mixin'
	import file from './file.mixin'
	import PlayVoice from "c%/playVoice"
	import InfoName from './info-name.vue'

	const resName   = 'file'
	const idField   = 'file_id'
	const textField = 'file_name'

	export default {
		mixins: [directive,grid,file],
		components: {
			PlayVoice,
			InfoName
		},
		props: {
			selVoice: {
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
				rest_api: 'files?media_type=voice',
				active_voice: -1,
				pageSize: this.size || 8
			}
		},
		watch: {
			selVoice: function (val) {
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
				if(this.selVoice.indexOf(id) === -1) {
					this.selVoice.push(id)
					this.refreshData(this.data)
				}
			},
			removeSelectedId(id) {
				let index = this.selVoice.indexOf(id)
	            if(index !== -1){
	                this.selVoice.splice(index,1)
	                this.refreshData(this.data)
	            }
			},
			replaceSelectedId(id){
	           if(this.selVoice.length == 0){
	                this.selVoice.push(id)
	            }else{
	                this.selVoice.splice(0,1,id)
	            }
	        },
	        refreshData(data) {
				data.forEach((item) => {
					if(this.selVoice.indexOf(item[idField]) !== -1) {
						item.$selected = true
					} else {
						item.$selected = false
					}
				})
			},
			playVoice(index) {
				this.active_voice = index
			}
 		}
	}
</script>
<style lang="less" scoped>
	.file-wrap {
		>.ivu-icon{
			right: 54px !important;
		}
	}
</style>