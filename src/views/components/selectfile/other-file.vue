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
    			v-for="item in data">
    			<div :class="['picture',{'page-pic': pageSize > 8}]">
	    			<img :src="replaceDefaultImage(item)" />
	    		</div>
				<Dropdown placement="bottom-end">
    				<a href="javascript:void(0)">
			            <Icon type="arrow-down-b" size="16"></Icon>
			        </a>
    				<DropdownMenu slot="list">
    					<DropdownItem @click.native.stop="downloadFile(item)">下载文件</DropdownItem>
						<DropdownItem v-if="!item.file_name" @click.native.stop="addFileName(item)">添加文件名</DropdownItem>
						<DropdownItem v-else @click.native.stop="editFileName(item)">修改文件名</DropdownItem>
						<DropdownItem @click.native.stop="delFile(item)">删除文件</DropdownItem>
    				</DropdownMenu>
    			</Dropdown>
    			<div class="file-name">
	    			<span>{{item.file_name}}&nbsp;</span>
	    			<i class="fa fa-weixin" style="color:#2b85e4" v-if="item.openid"></i>
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
	import InfoName from './info-name.vue'

	const resName   = 'file'
	const idField   = 'file_id'
	const textField = 'file_name'

	export default {
		mixins: [directive,grid,file],
		components: {
			InfoName
		},
		props: {
			selFile: {
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
				rest_api: 'files?media_type=file',
				pageSize: this.size || 8
			}
		},
		computed: {
			maxEmpty() {
				return this.pageSize > 8 ? 24 : 3
			}
		},
		watch: {
			selFile: function (val) {
				this.refreshData(this.data)
			}
		},
		mounted() {
			this.init_data()	
		},
		methods: {
			addSelectedId(id) {
				if(this.selFile.indexOf(id) === -1) {
					this.selFile.push(id)
					this.refreshData(this.data)
				}
			},
			removeSelectedId(id) {
				let index = this.selFile.indexOf(id)
	            if(index !== -1){
	                this.selFile.splice(index,1)
	                this.refreshData(this.data)
	            }
			},
			replaceSelectedId(id){
	           if(this.selFile.length == 0){
	                this.selFile.push(id)
	            }else{
	                this.selFile.splice(0,1,id)
	            }
	        },
			refreshData(data) {
				data.forEach((item) => {
					if(this.selFile.indexOf(item[idField]) !== -1) {
						item.$selected = true
					} else {
						item.$selected = false
					}
				})
			},
			replaceDefaultImage(item) {
				const suffixs = ['txt','doc','pdf','rar','zip','xls','ppt']
				let type = item.file_type
				if(type === 'pptx') {
					type = 'ppt'
				}
				if(type === 'docx') {
					type ='doc'
				}
				if(type === 'xlsx') {
					type = 'xls'
				}
				if(suffixs.indexOf(type) > -1) {
					return `http://sp1.xiao360.com/static/file/icon/${type}.png?imageView2/3/w/100/h/100`
				}else{
					return `http://sp1.xiao360.com/static/file/icon/default.png?imageView2/3/w/100/h/100`
				}
			},
			downloadFile(item) {
				item.isShowOperate = false
				var form = document.createElement('form')
			    form.style.display = 'none'
			    form.target = ''
			    form.method = 'get'
			    form.action = item.file_url
			    document.body.appendChild(form)
			    form.submit()
			}		
		}
	}
</script>