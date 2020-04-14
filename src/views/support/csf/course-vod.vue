<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="100" class="filter-form row">
				<Form-item label="视频标题" prop="title" class="col-md-3 col-sm-6">
					<Input v-model="search_field.title" placeholder="请输入视频标题..." clearable></Input>
				</Form-item>
                <Form-item label="视频分类" prop="vc_id" class="col-md-3 col-sm-6">
					<Select v-model="search_field.vc_id" clearable>
                        <Option v-for="(item,index) in vod_cates" :key="index" :value="item.vc_id">{{item.cate_name}}</Option>
                    </Select>
				</Form-item>
				<Form-item label="创建时间" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						label="创建时间" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>             		
                </Col>
           </Row>	
		</div>		
		<div class="box box-result">
			<div class="content">
				<div class="content-body">
                    <table class="modal-table">
	            		<thead>
	            			<tr>
	            				<th><div class="ivu-table-cell">#</div></th>
	            				<th><div class="ivu-table-cell">视频</div></th>
                                <th><div class="ivu-table-cell">分类</div></th>
								<th><div class="ivu-table-cell">创建时间</div></th>
	            			</tr>
	            		</thead>
	            		<tbody>
	            			<tr v-for="(item,index) in data" :key="index">
	            				<td><div class="ivu-table-cell">{{index + 1 + (pageIndex - 1) * pageSize}}</div></td>
	            				<td>
                                    <div class="ivu-table-cell">
                                        <div class="item-vod">
                                            <div class="item-img" @click="detail(item)">
                                                <img :src="item.cover_image_url" width="100" height="55">
                                                <Icon type="play"></Icon>
                                            </div>
                                            <div class="item-info">
                                                <p class="title">
                                                    <span>{{item.title}}</span>
                                                </p>
                                                <!--
                                                <p>视频ID：{{item.vid}}</p>
                                                <p>免费有效期：{{item.free_expire_time}}</p>
                                                -->
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td><div class="ivu-table-cell">{{item.vod_cate ? item.vod_cate.cate_name : ''}}</div></td>
                                <td><div class="ivu-table-cell">{{item.create_time}}</div></td>
	            			</tr>
	            			<tr v-if="data.length == 0">
	            				<td colspan="4" align="center"><div class="ivu-table-cell">没有数据</div></td>
	            			</tr>
	            		</tbody>
	            	</table>
		        </div>
		        <div class="content-footer">
		            <div class="pagenation">
		                <Page 
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
			</div>
		</div>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
    import DateRangePicker from 'c%/DateRangePicker.vue'
		
	export default{
		mixins: [ grid, common, globals ],
		components: {
            DateRangePicker
		},
		data () {
			return {
				rest_api: 'vod_files',		
				search_field: {
                    title: '',
                    vc_id:0,
                    create_time:[]
                },
                vod_cates:[]
			}
		},		
		mounted () {
            this.get_vod_cates()
			this.init_data()
		},
		methods: {
            get_vod_cates(){
                this.$rest('vod_cates')
                .get()
                .success(res => {
                    this.vod_cates = res.list
                })
            },
			resetSearch () {
                this.$form('ref_search').reset()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='create_time'){
                        if(property!=','&&property.length>0){
                            params[o] = util.sprintf('[Between,%s]',property.join(','))
                        }                                               
                    }
                    else{
                        if(property&&property!=0){
                            params[o] = property    
                        }       
                    }                                   
                }

                params.with = 'vod_cate'
			},
			detail (item) {
                this.$rest('vod_files')
                .add_url_param(item.vf_id,'auth')
                .get()
                .success(res => {
                    this.$Modal.open('support/csf/play-modal.vue@modal',{
                        props:{
                            videoInfo:res
                        }
                    })
                    .then(modal => {
                        modal.show(res.VideoMeta.Title,'add')
                    })
                })
                .error(res => {
                    this.error(res.body.message||'获取播放授权信息失败~')
                })
            }
		}
	}
</script>

<style lang="less" scoped>
    .item-vod{
        display:flex;
        height:55px;

        .item-img{
            position: relative;
            width: 100px;
            cursor: pointer;

            i{
                position: absolute;
                font-size: 24px;
                top: 15.5px;
                left: 42.5px;
                color: #e7e7eb;
            }
        }

        .item-info{
            position: relative;

            .title{
                span{
                    font-weight: bold;
                }
            }
        }
    }
</style>