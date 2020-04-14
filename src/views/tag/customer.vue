<style lang="less">
	@color-orange: #f90;
	@color-red: #ed3f14;
	.filter-form-input{
	    border: none;
	    border-radius: 0;
	    box-shadow: none;
	    border-bottom: 1px solid #ccc;
	}
	.filter-form{
		.ivu-input-wrapper{
			outline: none;
			.ivu-input{
				.filter-form-input;
			}			
		} 	
		.ivu-select {
			.ivu-select-selection{
			    .filter-form-input;
			}
		}	
	}
	.customer-list {
		label.ivu-checkbox-wrapper {
	    	margin-bottom: 0;
	    }
	}
	.follow-customer-list {
		position:absolute;
		width:130px;
		.ivu-select-item {
			text-align: center;
		}
	}
	.color-block{
	    display: inline-block;
	    height: 14px;
	    width: 14px;
	    overflow: hidden;
	    vertical-align: middle;
	    margin-bottom: 2px;	    
	}
	.color-red{
    	background: @color-red;
    }
    .color-orange{
    	background: @color-orange;
    }
    
    .text-orange{
    	color: @color-orange !important;
    }
    .text-red{
    	color: @color-red !important;
    }
</style>

<style scoped>
.table-title {
	font-weight: bold;
	margin-right: 15px
}
</style>


<template>
    <div class="c-grid">
        <div class="box box-result">
        	<div class="toolbar" style="margin: 10px 0px">
				<p class="x-tag-title">
                    <Tag class="x-tag" :color="tagColor">{{this.tagName}}</Tag>
                    <span>标签的客户列表</span>
                </p>
				<recruiting-info-modal ref="ref_modal_recruiting" @on-success="init_data"></recruiting-info-modal>
				<!-- <Dropdown trigger="click">
					<Button
						type="primary" 
						icon="more" 
						:disabled="follow_customers.length==0" 
						title="先勾选客户，可连续对客户进行操作"
						v-per="'customer.batch'">
						批量操作&nbsp;{{follow_customers.length}}
					</Button>
					<DropdownMenu slot="list">
						<DropdownItem @click.native="intoCommonCustomer"><Icon type="forward"></Icon> 转入客户公海</DropdownItem>
						<DropdownItem @click.native="followMulti"><Icon type="social-twitter"></Icon> 跟单</DropdownItem>
						<DropdownItem @click.native="assignMulti"><Icon type="contrast"></Icon> 分配</DropdownItem>
						<DropdownItem @click.native="audition"><Icon type="headphone"></Icon> 安排试听</DropdownItem>
						<DropdownItem @click.native="clearFollow"><Icon type="android-remove-circle"></Icon> 清空勾选</DropdownItem>
					</DropdownMenu>
				</Dropdown> -->
				<followInfoModal 
					ref="ref_follow" 
					:list="data"
					:page-size="pageSize"
					@on-prevpage="prev_page" 
					@on-nextpage="next_page" 
					@on-success="init_data">
				</followInfoModal>
				<filter-column :keys="column_keys"></filter-column>
        	</div>
	        <div class="content">
				<div class="content-body">
		            <Table 
		            	v-loading="'tag_relations'"
		            	class="customer-list" 
		            	ref="tableExcel"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
		            	:stripe="true" 
		            	:show-header="true" 
		            	:data="data" 
		            	:columns="columns" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-select="selectOne"
		            	@on-select-cancel="cancelSelect"
		            	@on-select-all="selectAll"
		            	@on-selection-change="selectChange"
		            	@on-sort-change="sortChange"> 
		            </Table>
		        </div>
		        <div class="content-footer">
		        	<div class="tip">
		        		<span class="color-block color-orange"></span> 跟进预警客户
		        		<span class="color-block color-red"></span> 即将被划入客户公海
		        	</div>
		            <div class="pagenation">
		                <Page 
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true" 
		                	:page-size-opts="bigPageSizeOption"
		                	@on-change="pagenation" 
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
			</div>
		</div>
		<trial-arrange ref="arrange" ></trial-arrange>
    </div>    	
</template>

<script>
	import Vue 					from 'vue'
	import grid 				from '@/libs/grid.mixin'
    import customer				from './customer.mixin'
    import common 				from '@/libs/common.mixin'
	import globals 				from '@/libs/globals.mixin'
	import FollowInfoModal 		from '../recruiting/following/follow-info-modal.vue'
	import TrialArrange 		from '../recruiting/customer/trial-arrange.vue'
	import RecruitingInfoModal  from '../recruiting/recruiting-info-modal.vue'
    
    import ImportButton 		from 'c%/ImportButton.vue'
    import RichTel 				from 'c%/RichTel.vue'
    
    Vue.component('rich-tel',RichTel)
    
	export default{
		mixins: [ common,grid,globals,customer ],
		components: {
			ImportButton,
			FollowInfoModal,
			TrialArrange,
			RecruitingInfoModal
		},
		props: {
			tagId: {
				type: Number,
				default: 0
			},
			tagName: {
				type: String,
				default: ''
			},
			tagColor: {
                type: String,
                default: ''
            }
		},
		data () {
			return {
				rest_api: 'tag_relations',
				pk: 'cu_id',
				datakey: 'customer',
				res_id: 'follow_eid',
				is_reg: '0',
				pageSize: 10,
				type_customer: '',				
				search_field_from_did:[],	
				showEmptyColumn: true,
				// showCheckbox: true,
				search_field: {
					tag_id: 0,
					tag_type: 3
				}
			}
		},
		mounted () {
			this.search_field.tag_id = this.tagId;
			this.init_data();
		},
		
		watch: {
			tagId(val) {
				this.search_field.tag_id = val;
				this.init_data();
			},
			'$store.state.branch.ids':{
	            handler:function(bid,old_bid){
	                if(this.rest_api == ''){
	                    return
	                }
	                this.init_data()
		            },
	            // 深度观察
	            deep:true
        	},
        	is_reg: function(val) {
        		this.init_data()
        		this.column_keys.signup_int_day.show = val==1
        		this.column_keys.signup_amount.show = val==1
        		this.column_keys.performance_eid.show = val==1
        		this.column_keys.intention_level.show = val==0
        	},
        	'type_customer': function(val) {
        		this.init_data()
        	}
        }        
	}
</script>