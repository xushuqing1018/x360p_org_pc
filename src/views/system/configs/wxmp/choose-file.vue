<style lang="less">
	.custom-file-item{
		position: relative;
		.custom-file-mask{
			display: none;
			font-size: 0;
		    position: absolute;
		    top: 0;
		    left: 0;
		    right: 0;
		    bottom: 0;
		    background: rgba(0,0,0,0.6)!important;
		    color: #fff;
		    z-index: 1;
		    text-align: center;
		    padding: 14px;
		    i{
		    	position: absolute;
			    top: 50%;
			    left: 50%;
			    margin-top: -23px;
			    margin-left: -23px;
			    overflow: hidden;
			    z-index: 1;
		    }
		}
		&:hover{
			outline: none !important;
		}
		&:hover .custom-file-mask,&.selected .custom-file-mask{
			display: block;						
		}
	}
</style>

<template>
	<div class="content">
		<Row class="mb-3" v-if="type=='news'||type=='voice'">
			<Col span="24" class="al-c">
				<date-range-picker v-model="params.update_time" @on-change="dateChange"  label="更新日期" placement="bottom">
				</date-range-picker>
			</Col>
		</Row>
		<data-ready :data="['wxmp_materials?type='+type]" @ready="dataReady">
							
			<!--图文-->
			<waterfall :line-gap="289" :watch="data" v-if="type=='news'" style="overflow-y: auto;">
			  <waterfall-slot
			    v-for="(item, index) in data"
			    :order="index"
			    :key="item.media_id"
			    :height="352+((item.items.length-1)*103)"
			    :width="289"
			    style="width:289px;"
			    v-if="item.items&&item.items.length>0"
			  >
			  	<div class="source-card-item" @click="chooseFile(item)">
	    			<div class="source-card-content custom-file-item" :class="item==active_item?'selected':''">		
	    				<div class="source-card-header">
							<span>{{item.update_time|format_time}}</span>
						</div>
						<div class="content-img-item">
							<h4 class="card-body-title">{{item.items[0].title}}</h4>
							<div class="card-body-image" :style="{backgroundImage:'url('+format_wx_img(item.items[0].thumb_url)+')'}"></div>
							<p class="card-body-desc">{{item.items[0].digest}}</p>						
						</div>
						<div class="content-article-item" v-if="item.items.length>1&&articleIndex>0" v-for="(article,articleIndex) in item.items" :key="articleIndex">
							<div class="appmsg-thumb" :style="{backgroundImage:'url('+format_wx_img(article.thumb_url)+')'}"></div>
							<span class="card-body-title">{{article.title}}</span>						
						</div>
						<div class="custom-file-mask">
							<Icon type="checkmark" size="46"></Icon>
						</div>
					</div>					
			    </div>
			  </waterfall-slot>
			</waterfall>
			
			<!--图片-->
			<ul class="source-img-list" v-if="type=='image'">
	    		<li class="source-img-item custom-file-item" :class="item==active_item?'selected':''"
	    			@click="chooseFile(item)"
	    			v-for="(item,index) in data" style="width:calc(25% - 30px) !important" :key="index">
	    			<div class="source-img-header">
	    				<span class="source-img-title">{{item.name}}</span>
	    			</div>
	    			<div class="source-img-content">
	    				<img :src="format_wx_img(item.url)">
	    			</div>  
	    			<div class="custom-file-mask">
						<Icon type="checkmark" size="46"></Icon>
					</div>
	    		</li>
	    	</ul>
	    	
			<!--语音-->
			<table class="modal-table mb-3" v-if="type=='voice'">
				<thead>
					<th><div class="ivu-table-cell"></div></th>
					<th><div class="ivu-table-cell">名称</div></th>
					<th><div class="ivu-table-cell">创建时间</div></th>
					<th><div class="ivu-table-cell"></div></th>
				</thead>
				<tr @click="chooseFile(item)" v-for="(item,index) in data" :key="index">
					<td>
						<div class="ivu-table-cell">
							<Radio :value="active_item==item"></Radio>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">{{item.name}}</div>
					</td>
					<td>
						<div class="ivu-table-cell" style="width:150px">{{item.update_time|format_time}}</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<play-voice 
								:active="active_voice===index"
        						@click.native.stop="active_voice=index"
        						:src="'http://qms.xiao360.com/api/open/wxvoice?media_id='+item.media_id">
							</play-voice>
						</div>
					</td>
				</tr>
				<tr v-if="!data.length">
					<td colspan="4">
						<div class="ivu-table-cell al-c">暂无数据~</div>
					</td>
				</tr>
			</table>		
	    	
			<!--视频-->
			<ul class="source-video-list" v-if="type=='video'">
	    		<li class="source-img-item custom-file-item"
	    			:class="item==active_item?'selected':''"
	    			style="width: calc(33% - 30px)!important;"
	    			@click="chooseFile(item)" v-for="(item,index) in data" :key="index">
	    			<div class="source-img-header">
	    				<span class="source-img-title">{{item.name}}</span>
	    			</div>
	    			<div class="source-img-content">        				
	    				<div class="source-video-cover">
	    					<Icon type="ios-videocam" size="50"></Icon>
	    				</div>
	    				<img src="http://omyc1h52u.bkt.clouddn.com/7205e7cd26829b83f49499dea2ad519b.mp4?vframe/jpg/offset/1/w/207/h/169">
	    			</div>    
	    			<div class="custom-file-mask">
						<Icon type="checkmark" size="46"></Icon>
					</div>
	    		</li>
	    	</ul>
			
			<div class="al-c" v-if="!data.length&&['news','image','video'].indexOf(type)>-1">暂无数据~</div>
		</data-ready>
		
		<Row class="mb-3" :gutter="10" v-if="type=='keyword'">
			<Col span="6" v-for="(item,index) in data" :key="index">
				<a class="keyword-item" @click="chooseFile(item)" :class="rule_id==item.rule_id?'active':''">
					<span class="mr-2">
						<template v-for="(words,wordsIndex) in item.keywords">
							{{words.content}}  
						</template>    						
					</span>
				</a>
			</Col>
		</Row>
		
		<div class="content-footer" v-if="type!='text'">
            <div class="pagenation">
                <Page :total="total" :current="pageIndex" :show-sizer="true" :page-size="pageSize" :show-total="true" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
            </div>
        </div>    
		<Input v-model="content" type="textarea" :rows="4"  placeholder="请输入..." v-if="type=='text'"></Input>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import DataReady from 'c%/DataReady.vue'
	import playVoice from 'c%/playVoice.vue'
	import Waterfall from 'vue-waterfall/lib/waterfall'
	import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default{
		mixins: [grid],
		components:{
			DataReady,
			playVoice,
			Waterfall,
			WaterfallSlot,
			DateRangePicker
		},
		props: {
			type: {
				type: String,
				default: 'image'
			}
		},
		data () {
			return {
				data: [],
				active_voice: -1,
				rule_id: 0,
				spinShow: false,
				rest_api: 'wxmp_materials?type='+this.type,
				pk: 'material_id',
				active_item: {},
				content: '',
				params:{
                    update_time:util.month_range()
                },
			}			
		},
		filters: {
			format_time (val) {
				return moment(val).format('YYYY-MM-DD')
			}
		},
		watch: {
			type: function (val) {
				this.init_data()
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {	
				if(this.type=='news'||this.type=='voice'){
					params.update_time = util.get_date_query(this.params.update_time)
				}
				
				if(this.type=='keyword'){
					this.rest_api = 'wxmp_rules'
					this.pk = 'rule_id'
				}
			},
			dateChange(date_arr) {
	        	this.params.update_time = date_arr
	        	this.init_data()
	        },
			dataReady (rs) {
				this.data = rs[0].list
			},			
			format_wx_img (src) {
				return this.$store.state.user.info.base_url+'/api/open/wximage?url='+src
			},
			chooseFile (item) {
				this.active_item = item
				if(this.type=='keyword'){
					this.rule_id = item.rule_id
				}
			},
			getFile () {
				if(this.type=='text'){
					this.$emit('getFile',this.content)
				}else{
					this.$emit('getFile',this.active_item)
				}
			}
		}
	}
</script>
