<template>
	<div class="c-grid app-c-grid">
		<div class="box box-query">
			<Input v-model="search_field.name" placeholder="书名、作者、ISBN" style="width:280px" icon="ios-search" @keyup.enter.native="search"></Input>
			
			<Button type="primary" @click="search" icon="ios-search">搜索</Button>
			<Button type="primary" @click="resetSearch" icon="refresh">重置</Button>
			<export-button res="books" :params="params"></export-button>
		</div>
		
		<div class="box box-result">
			<div class="toolbar text-center">
				<Button type="primary" @click="addInfo" icon="plus">添加图书</Button>	
				<Button type="primary" class="ml-3" @click="borrowInfo" icon="forward">借书</Button>	
				<Button type="primary" class="ml-3" @click="borrowRecord()" icon="ios-clock-outline">借书记录</Button>
			</div>
			
			<div class="content-body">
				<div class="book-container">
					<Spin size="large" fix v-if="loading"></Spin>
					<div class="empty-img" v-if="!data||!data.length">
						<span v-if="search_field.name.length > 0">没有找到对应书籍~</span>
						<span v-else>还没有图书，快去添加一本吧！</span>
					</div>
					<div class="book-item" v-for="item in data">
						<div class="book-item-box">
							<div class="book-item-img">
								<img :src="item.cover_image_url">
							</div>
							<div class="book-item-content">
								<div class="book-item-content-left">
									<p :title="item.name">书名：{{item.name}}</p>
									<p :title="item.author">作者：{{item.author}}</p>									
									<p>出版年：{{item.pub_int_day|pub_int_date}}</p>
									<p>页数：{{item.pages}}</p>
									<p :title="item.place_no">存放位置：{{item.place_no||'-'}}</p>
								</div>
								<div class="book-item-content-right">
									<p>分类：{{item.book_cate_did|dict_title('book_cate','-')}}</p>
									<p>ISBN：{{item.isbn}}</p>
									<p>数量：{{item.qty}}/{{item.total_qty}}</p>
									<p>定价：{{item.price}}元</p>
									<!--<p>状态：
										<Tag type="border" :color="item.status==1?'green':'red'">{{map_status[item.status]}}</Tag>
									</p>-->									
									<p>
										<dropdown :transfer="true" >
											<Button type="primary" size="small" icon="ios-gear">操作</Button>
											<dropdown-menu slot="list">
												<dropdown-item @click.native="editInfo(item)"><Icon type="edit"></Icon> 编辑</dropdown-item>																						
												<dropdown-item @click.native="borrowRecord(item)" v-if="item.qty < item.total_qty">
													<Icon type="ios-clock"></Icon> 借阅记录
												</dropdown-item>
												<dropdown-item @click.native="bookQTY(item,1)"><Icon type="plus"></Icon> 入库</dropdown-item>
												<dropdown-item @click.native="bookQTY(item,0)"><Icon type="wrench"></Icon> 报损</dropdown-item>
												<dropdown-item @click.native="delBook(item)"><Icon type="trash-a"></Icon> 删除书籍</dropdown-item>
											</dropdown-menu>
										</dropdown>
										
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
	    	</div>        
	    	<div class="content-footer mt-3">
	            <div class="pagenation text-right">
	                <Page 
	                	:total="total" 
	                	:current="pageIndex" 
	                	:show-sizer="true" 
	                	:page-size="pageSize" 
	                	:show-total="true" 
	                	:page-size-opts="pageSizeOpts"
	                	@on-change="pagenation" 
	                	@on-page-size-change="pagesize">
	                </Page>
	            </div>
	        </div>
	        
		</div>
		
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import book from './book.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [ grid, common, globals, book ],
		components: {
			ExportButton
		},
		data () {
			return {
				rest_api: 'books',
				pk: 'bk_id',
				loading: false,
				search_field: {
					name: ''
				},
				map_status:{1:'可借用',0:'不可借'},
				pageSize: 12,
				pageSizeOpts: [12,24,36]
				
			}
		},
		
		mounted () {
			this.init_data()
		},
		methods: {
			editInfo (item) {
				this.$Modal.open('app/books/info-modal.vue',{
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					let info = util.copy(item)
					info.pub_int_day = this.$filter('pub_int_date')(item.pub_int_day)
					info.price = Number(info.price)
					
					modal
					.set('info',info)
					.show(`编辑图书【${item.name}】`,'edit')
				})
			},			
			resetSearch () {
				this.search_field.name = ''
				this.search()
			},
			hook_get_param (params) {
				let search_field = this.search_field
				
				if(!/$\s*^/.test(search_field.name)){
					params.name = search_field.name 
				}
				this.loading = true
			},
			deal_data (data) {
				this.loading = false
				return data.list
			},
			addInfo () {
				this.$Modal.open('app/books/info-modal.vue',{
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加图书')
				})
			},	
			delBook(item){
				this.confirm(util.sprintf('确定删除【%s】',item.name))
				.then(() => {
					this.delete(item)
				})
			},	
			bookQTY (row,type) {
				let map_title = {1:'入库',0:'报损'}
				this.$Modal.open('app/books/qty-modal.vue',{
					props: {
						type: type,
						bkId: row.bk_id
					},
					on: {
						'on-success': () => {
							this.init_data()
						}
					}
				}).then(modal=>{
					modal.show(`【${row.name}】${map_title[type]}`)
				})
			}
		}
		
	}
	
</script>

<style lang="less">
.app-c-grid{
	.box .ivu-btn{
		padding: 6px 15px;
		&.ivu-btn-small{
			padding: 2px 7px;
		}
	}	
}

.book-container{
	display: flex;
	position: relative;
	flex-wrap: wrap;
	
	.empty-img{
		height: 450px;
		width: 100%;
		background: url('http://s1.xiao360.com/nothing-notice.png') no-repeat center;
		background-color: #f5f5f5;
		text-align: center;
		span{
			margin-top: 280px;
		    display: inline-block;
		    font-size: 14px;
		    color: #cccccc;
		}
	}
	
	.book-item{
		flex: 0 0 33.33%;
		height: 180px;		
		padding: 10px;
        overflow: hidden;
        
        .book-item-box{
        	width: 100%;
        	height: 100%;
        	padding: 20px;
        	display: flex;
			box-sizing: border-box;
			background: #F5F7F9;
			border-radius: 3px;
			transition: all .3s; 
			
			&:hover{
			    box-shadow: 0 0 5px rgba(0,0,0,.3);
		        transform: translateY(-5px);     	
	        	.book-item-img{
	        		img{
	    			    transform: scale(1.1) translateX(-5px);
	    				opacity: 1;
	        		}
	        	}
	        }
	        .book-item-content {
			    margin-left: 10px;
			    flex: 1;
			    
			    .book-item-content-left,
			    .book-item-content-right{
			    	float: left;
			    	width: 50%;
			    	height: 100%;
			    	display: flex;
			    	flex-direction: column;
			    	justify-content: space-around;
			    	
			    	p {
					    white-space: nowrap;
					    width: 100%;
					    overflow: hidden;
					    text-overflow: ellipsis;
					    padding-right: 10px;
					}
			    }
			}
			
			.book-item-img{
				img{
					width: 96px;
					max-height: 100%;
					opacity: .8;
					transition: all .3s;
				}
			}
        }
        
	}
}

@media screen and (max-width: 1440px) {
	.book-container .book-item{
		flex: 0 0 50%;
	}
}

</style>