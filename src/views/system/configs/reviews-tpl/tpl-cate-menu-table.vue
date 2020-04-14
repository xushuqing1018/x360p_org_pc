<template>
<div>
	<div class="mb-2">
		<Dropdown trigger="click" v-if="rtcId==0">
			<Button 
				type="primary" 
				size="small" 
				:disabled="rts_ids.length==0||cates.length==0" 
				v-per="'comments.cate'"
				>批量分类{{rts_ids.length||''}}
			</Button>
			<DropdownMenu slot="list">
				<DropdownItem @click.native="batchBindSort(item)" v-for="item in cates">{{item.name}}</DropdownItem>
			</DropdownMenu>
		</Dropdown>
		<Button 
			type="primary" 
			size="small" 
			:disabled="rts_ids.length==0" 
			@click="batchModify">
			批量修改{{rts_ids.length||''}}
		</Button>
		<Input 
			class="pull-right"
			size="small" 
			v-model.trim="search_value" 
			placeholder="搜索模板" 
			@on-change="search"
			style="width: 200px;">
		</Input>
	</div>
	<div class="content-body">
        <Table 
	        v-loading="'review_tpl_settings'" 
	        :page-size="pageSize" 
	        :page="pageIndex" 	
	        :stripe="true" 
	        :show-header="true" 
	        :data="data" 
	        :columns="columns" 
	        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
	        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
	        @on-sort-change="sortChange"
	        @on-select-cancel="cancelSelect"
	        @on-selection-change="selectionChange"
	        > 
        </Table>
    </div>
    <div class="content-footer">
        <div class="clearfix">
            <Page 
            	class="pull-right mt-2"
            	size="small"
	            :total="total" 
	            :current="pageIndex" 
	            :show-sizer="true" 
	            :page-size="pageSize" 
	            :show-total="true" 
	            @on-change="pagenation" 
	            @on-page-size-change="pagesize"
            >
            </Page>
        </div>
    </div>
</div>
</template>
<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		props: {
			rtcId: {
				type: Number,
				default: 0
			},
			cates: {
				type: Array,
				default(){
					return []
				}
			}
		},
		mixins: [grid,common,globals],
		data() {
			return {
				rest_api: 'review_tpl_settings',
				rts_ids: [],
				search_value: '',
				showCheckbox: true,
				firstRow: {},
				column_keys: {
	                name: {
	                    title: '模板名称',
	                    show:true
	                },
	                rtc_id: {
	                    title: '所属分类',
	                    show: true,
	                    width: 150
	                },
	                operation: {
	                    title: '操作',
	                    show: true,
	                    width: 100
	                }
	            },
	            column_render: {
	                name (h,params) {
	                    let NameElement = h('a', {
	                        on: {
	                            click: () => {
	                            	this.$emit('on-select', params.row);
	                            }
	                        },
	                        style: {
	                            color: '#39f'
	                        }
	                    }, params.row.name);
	                    let StyleTagElement = h('Tag',{
	                        props: {
	                            color: 'red',
	                            size: 'small'
	                        },
	                        style: {
	                            marginLeft: '5px'
	                        }
	                    }, '专业');
	                    let DefaultTagElement = h('Tag',{
	                        props: {
	                            color: 'blue',
	                            size: 'small'
	                        },
	                        style: {
	                            marginLeft: '5px'
	                        }
	                    }, '默认');
	                    {
	                        if(params.row.review_style == 0){
	                            return h('span', [NameElement])
	                        }
	                        else {
	                            return h('span', [NameElement, StyleTagElement])
	                        }
	                    }
	                },
	                rtc_id (h,params) {
	                    if(params.row.review_tpl_cate) {
	                        return h('span',params.row.review_tpl_cate.name)
	                    }else{
	                        return h('span',{
	                            style: {
	                                color: '#ccc'
	                            }
	                        },'还没有设置分类')
	                    }
	                },
	                operation (h,params) {
	                    let DeleteElement = h('Button', {
	                        props: {
	                            type: 'ghost',
	                            size: 'small'
	                        },
	                        directives: [
	                        	{name:'per',value:'comments.cate'}
	                        ],
	                        on: {
	                            click: (e) => {
	                            	e.stopPropagation()
	                                this.removeSort(params.row)
	                            }
	                        }
	                    },'解除分类');
	                    let cateItems = []
	                    this.cates.forEach(c => {
	                    	cateItems.push(h('Dropdown-item',{
		                    	nativeOn: {
		                    		click: (e) => {
		                    			e.stopPropagation()
		                    			this.oneBindSort(c,params.row)
		                    		}
		                    	}
		                    },c.name))
	                    })
	                    let SortElement = h('Dropdown',{
	                    	directives: [
	                        	{name:'per',value:'comments.cate'}
	                        ]
	                    },[
	                    	h('Button',{
	                    		props: {
	                    			type: 'ghost',
	                    			size: 'small'
	                    		},
	                    		on: {
	                    			click:(e) => {
	                    				e.stopPropagation()
	                    			}
	                    		}
	                    	},'去分类'),
	                    	h('Dropdown-menu',{
	                    		slot:'list'
	                    	},cateItems)
	                    ])
	                    if(this.cates.length) {
	                    	return h('div',params.row.rtc_id?[DeleteElement]:[SortElement])
	                    }
	                    else {
	                    	return h('span','还没创建分类')
	                    }
	                }
	            },
	            showIndex: false,
			}
		},
		mounted() {
			
		},
		methods: {
			batchModify() {
				this.$Modal.open('system/configs/reviews-tpl/batch-modify-image.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
							this.$emit('on-modify-success')
						}
					},
					props: {
						ids: this.rts_ids,
						'tpl-row': this.firstRow
					}
				})
				.then(modal => {
					modal.show('批量修改模板')
				})
			},
			batchBindSort(cate) {
				this.bindSort(cate.rtc_id,this.rts_ids)
			},
			oneBindSort(cate,row) {
				this.bindSort(cate.rtc_id,[row.rts_id])
			},
			bindSort(rtc_id,rts_ids) {
				this.$rest('review_tpl_settings').add_url_param('bind_cate')
				.post({
					rts_ids: rts_ids,
					rtc_id: rtc_id
				})
				.success(res => {
					this.$Message.success('分类成功')
					this.rts_ids = []
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			removeSort(row) {
				let copy = util.copy(row)
				copy.rtc_id = 0
				this.$rest('review_tpl_settings').add_url_param(row.rts_id)
				.put(copy)
				.success(res =>{
					this.$Message.success('解除成功')
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			selectionChange(selection) {
				if(selection.length){
					selection.forEach(d=>{
						if(_.isEmpty(this.firstRow)&&d.review_style==1) {
							this.firstRow = d
						}
						if(this.rts_ids.indexOf(d.rts_id)==-1) {
							this.rts_ids.push(d.rts_id)
						}
					})
				}else{
					this.data.forEach(d => {
						let index = this.rts_ids.indexOf(d.rts_id)
						if(index > -1) {
							this.rts_ids.splice(index,1)
						}
					})
					if(this.rts_ids.length==0) {
						this.firstRow = {}
					}
				}
			},
			cancelSelect(selection,row) {
				let index = this.rts_ids.indexOf(row.rts_id)
				if(index > -1) {
					this.rts_ids.splice(index,1)
				}
			},
			deal_data(data) {
				data.list.forEach(l => {
					l._checked = this.rts_ids.indexOf(l.rts_id)>-1?true:false
				})
				return data.list
			},
			hook_get_param(params) {
				if(this.rtcId) {
					params.rtc_id = this.rtcId
				}
				if(this.search_value) {
					params.name = this.search_value
				}
				params.with = 'review_tpl_cate'
			}
		},
		watch: {
			rtcId() {
				this.rts_ids = []
				this.firstRow = {}
				this.search()
			},
			cates() {
				this.search()
			}
		}
	}
</script>