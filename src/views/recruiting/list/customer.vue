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
	
	.to-be-follow label {
		margin-bottom: 0px;
	}
</style>

<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row"> 
                <Form-item label="姓名" class="col-md-3 col-sm-6" prop="name">
                	<Input v-model="search_field.name" placeholder="请输入姓名" @keyup.native.enter="init_data"></Input>
                </Form-item>
                <Form-item label="未跟进天数" class="col-md-3 col-sm-6" prop="un_follow_days">
                   <Select v-model="search_field.un_follow_days" clearable>
                   		<Option :value="-2">不限</Option>
                   		<Option :value="-1">从未跟进</Option>
                   		<Option :value="7">一周未跟进</Option>
                   		<Option :value="14">两周未跟进</Option>
                   		<Option :value="21">三周未跟进</Option>
                   </Select> 
              	</Form-item>
                <Form-item label="客户状态" class="col-md-3 col-sm-6" prop="customer_status_did">
                   <Select v-model="search_field.customer_status_did" clearable>
                   		<Option :value="item.did" v-for="(item,index) in dicts('customer_status')" :key="index">{{item.title}}</Option>
                   </Select>                           
                </Form-item>   
                 <Form-item label="招生来源" class="col-md-3 col-sm-6" prop="from_did">
                   <dictionary-from v-model="search_field.from_did" clearable></dictionary-from>
                </Form-item>
                <template v-if="searchExpand">
                	<Form-item label="市场渠道" prop="school_id" class="col-md-3 col-sm-6">
						<select-channel v-model="search_field.mc_id" :show-add="false" clearable></select-channel>
					</Form-item>
                	<Form-item label="责任人" class="col-md-3 col-sm-6" prop="res_id" v-if="type_customer=='all'">                    
	                   <select-employee v-model="search_field.follow_eid" v-show="res_id=='follow_eid'" clearable style="width:55%"></select-employee>
	                   <select-employee v-model="search_field.second_eid" v-show="res_id=='second_eid'" clearable style="width:55%"></select-employee>
	                   <Select v-model="res_id" style="width:calc(40% - 2px);margin-left:2px">
	                   		<Option value="follow_eid">主责任人</Option>
	                   		<Option value="second_eid">副责任人</Option>
	                   </Select>
	                </Form-item>  
                	<Form-item label="首选号码" class="col-md-3 col-sm-6" prop="first_tel">
	                	<Input v-model="search_field.first_tel" placeholder="请输入首选手机号码"></Input>
	                </Form-item>
	                <Form-item label="第二号码" class="col-md-3 col-sm-6" prop="second_tel">
	                	<Input v-model="search_field.second_tel" placeholder="请输入第二联系人手机号码"></Input>
	                </Form-item>
	                <Form-item label="性别" prop="sex" class="col-md-3 col-sm-6">
						<Select v-model="search_field.sex">
							<Option v-for="item in sexOptions" :value="item.value">{{item.label}}</Option>							
						</Select>
					</Form-item>
	                <Form-item label="年龄" class="col-md-3 col-sm-6" prop="age">
	                	<select-age v-model="search_field.age"></select-age>
	                </Form-item>	               
	                <Form-item label="下次跟进" class="col-md-3 col-sm-6" prop="next_follow_time">
	                    <date-range-picker 
	                    	v-model="search_field.next_follow_time" 
	                    	@on-change="search"  
	                    	label="选择日期" 
	                    	placement="bottom"
	                    	style="width:100%">
						</date-range-picker>
	                </Form-item>	                
	                <Form-item label="意向级别" class="col-md-3 col-sm-6" prop="intention_level">
					    <Select v-model="search_field.intention_level" multiple style="width: 100%">
							<Option v-for="item in starList" :value="item.value" :key="item.value">{{ item.label }}</Option>
						</Select>
	                </Form-item>
	                <Form-item label="意向课程" class="col-md-3 col-sm-6" prop="lid">
	                	<select-lesson v-model="search_field.lid" clearable></select-lesson>
	                </Form-item>
	                <Form-item :label="'意向'+label_teacher" class="col-md-3 col-sm-6" prop="eid">
	                	<select-employee v-model="search_field.eid" :rid="1" clearable></select-employee>
	                </Form-item>	                
	                <Form-item label="公立学校" prop="school_id" class="col-md-3 col-sm-6" v-if="isEF('school_id','customer')">
						<select-public-school v-model="search_field.school_id" clearable></select-public-school>
					</Form-item>
					<Form-item label="年级" class="col-md-3 col-sm-6" prop="school_grade" v-if="isEF('school_grade','customer')">
	                   <Select v-model="search_field.school_grade" clearable>
							<Option :value="item.name" v-for="(item,index) in dicts('grade')" :key="index">{{item.title}}</Option>
						</Select>
	                </Form-item>
	                <Form-item label="班级" class="col-md-3 col-sm-6" prop="school_class" v-if="isEF('school_class','customer')">
	                   <Input v-model="search_field.school_class" placeholder="请输入班级"></Input>
	                </Form-item>
	                <Form-item label="身份证号" class="col-md-3 col-sm-6" prop="id_card_no" v-if="isEF('id_card_no','customer')">
	                	<Input v-model="search_field.id_card_no" placeholder="请输入身份证号" @keyup.native.enter="init_data"></Input>
	                </Form-item>
					<Form-item label="方便试听时间" :label-width="100" class="col-md-3 col-sm-6" prop="trial_time" v-if="isEF('trial_time','customer')">
	                	<Select v-model="search_field.trial_time" multiple>
							<Option v-for="item in trial_times" :value="item.value">{{item.label}}</Option>
						</Select>
	                </Form-item>
	                <Form-item label="录单人" class="col-md-3 col-sm-6" prop="create_uid">
	                	<select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
	                </Form-item>
	                <Form-item label="录入时间" class="col-md-3 col-sm-6" prop="create_time">
	                    <date-range-picker 
	                    	v-model="search_field.create_time" 
	                    	@on-change="search"  
	                    	label="选择日期" 
	                    	placement="bottom"
	                    	style="width:100%">
						</date-range-picker>
	                </Form-item>
	                <Form-item label="获取时间" class="col-md-3 col-sm-6" prop="get_time">
	                    <date-range-picker 
	                    	v-model="search_field.get_time" 
	                    	@on-change="search"  
	                    	label="选择日期" 
	                    	placement="bottom"
	                    	style="width:100%">
						</date-range-picker>
	                </Form-item>
	                <Form-item label="分配时间" class="col-md-3 col-sm-6" prop="assign_time">
	                    <date-range-picker 
	                    	v-model="search_field.assign_time" 
	                    	@on-change="search"  
	                    	label="选择日期" 
	                    	placement="bottom"
	                    	style="width:100%">
						</date-range-picker>
					</Form-item>
	                <Form-item label="采单人" class="col-md-3 col-sm-6" prop="get_eid">
	                	<select-employee v-model="search_field.get_eid" clearable ></select-employee>
	                </Form-item>
	                <Form-item label="采单地点" class="col-md-3 col-sm-6" prop="get_address_did">
	                	<Select v-model="search_field.get_address_did" clearable>
							<Option :value="item.did" v-for="(item,index) in dicts('get_address')" :key="index">{{item.title}}</Option>
						</Select>
	                </Form-item>
                </template>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                	<Button-group>
                        <Button type="primary" icon="ios-search" v-tooltip="'查询'" @click="search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                    <export-button res="customers" :params="params" v-per="'customer.export'" :total="total" :max-sync-nums="1000"></export-button>
                    
                    <Button type="ghost" icon="android-cloud-outline" @click="commonCustomer">客户公海</Button>
                    
                    <CheckboxGroup v-model="search_field.is_distribution" class="ml-3" style="display: inline-block;" v-if="type_customer == 'all'">                        
                        <Checkbox :label="0">
                            <span>待分配</span>
                        </Checkbox>
                        <Checkbox :label="1">
                            <span>已分配</span>
                        </Checkbox>
                    </CheckboxGroup>

					<Badge :count="next_follow_time_nums" class="to-be-follow">
						<Checkbox v-model="toBeFollow" @on-change="changeFollow">待跟进</Checkbox>
					</Badge>
                    <div class="pull-right">
                        <per-scope per="customer.all" @on-change="perScopeChange"></per-scope>
                    </div>
                   	<div class="pull-right mr-4">
                        <label>当前列表：</label>
                        <ButtonGroup>
                            <Button :type="is_reg==0?'primary':'ghost'" icon="ios-person-outline" @click="is_reg=0">未报名</Button>
                            <Button :type="is_reg==1?'primary':'ghost'" icon="ios-person" @click="is_reg=1">已报名</Button>
                        </ButtonGroup>
                   	</div> 
                </Col>
            </Row>
        </div>
        <div class="box box-result">
        	<div class="toolbar">
				<template v-if="allow_cu_add">
					<Button type="primary" icon="plus" @click="customerAdd" v-per="'customer.add'">添加</Button>
					<recruiting-info-modal ref="ref_modal_recruiting" @on-success="init_data"></recruiting-info-modal>
					<import-button res="customers" name="客户" @on-import-finish="init_data" v-per="'customer.import'"></import-button>
				</template>
				<Dropdown trigger="click">
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
						<DropdownItem @click.native="batchDelete(2)"><Icon type="trash-a"></Icon> 删除</DropdownItem>
						<DropdownItem @click.native="clearFollow"><Icon type="android-remove-circle"></Icon> 清空勾选</DropdownItem>
						<DropdownItem @click.native="selectProjects" v-if="enable_project" ><Icon type="ios-shuffle"></Icon> 分配项目</DropdownItem>
						<DropdownItem @click.native="batSendSms" v-if="hasPer('dashboard.sendsms')"><Icon type="chatbubble"></Icon> 发送短信</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<followInfoModal 
					ref="ref_follow" 
					:list="data"
					:page-size="pageSize"
					@on-prevpage="prev_page" 
					@on-nextpage="next_page" 
					@on-success="init_data">
				</followInfoModal>
				<filter-column :keys="column_keys" v-if="column_keys_ready"></filter-column>
        	</div>
	        <div class="content">
				<div class="content-body">
		            <Table 
		            	v-loading="'customers'"
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
    
    import SelectAge 			from 'c%/SelectAge'
    import ImportButton 		from 'c%/ImportButton.vue'
    import TrialArrange 		from '../customer/trial-arrange.vue'
    import SelectEmployee 		from 'c%/SelectEmployee.vue'
    import SelectLesson 		from 'c%/SelectLesson.vue' 
    import DictionaryFrom 		from 'c%/DictionaryFrom.vue'
    import DateRangePicker 		from 'c%/DateRangePicker.vue'
    import FollowInfoModal 		from '../following/follow-info-modal.vue'
    import RecruitingInfoModal  from '../recruiting-info-modal.vue'
    import RichTel 				from 'c%/RichTel.vue'
    import SelectPublicSchool   from 'c%/SelectPublicSchool.vue'
	import SelectChannel 		from 'c%/SelectChannel.vue'

    import ExportButton			from 'c%/ExportButton.vue'
    
    Vue.component('rich-tel',RichTel)
    
	export default{
		mixins: [ common,grid,globals,customer ],
		components: {
			SelectAge,
			ImportButton,
			TrialArrange,
			DictionaryFrom,
			SelectEmployee,
			DateRangePicker,
			FollowInfoModal,
			RecruitingInfoModal,
			SelectLesson,
			ExportButton,
			SelectPublicSchool,
			SelectChannel
		},
		data () {
			return {
				rest_api: 'customers',
				pk: 'cu_id',
				datakey: 'customer',
				res_id: 'follow_eid',
				is_reg: '0',
				type_customer: '',				
				search_field_from_did:[],	
				showEmptyColumn: true,
	            showCheckbox: true,
				toBeFollow: false,
				pageSize: 30,
				tag_id: 0
			}	
		},
		created(){
			if(this.userPers.indexOf('customer.all') > -1) {
				this.type_customer = 'all'
			}else{
				this.type_customer = 'my'
			}
		},
		mounted() {
            this.replaceSearchField()
            this.initOptionFieldsColumn()
            this.initDisableFieldCloumns('customer')
        },
        beforeDestroy() {
            this.setStateSearchDetail(false)
        },
		watch: {
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
				this.search_field.is_reg = val;
        		this.init_data()
        		this.column_keys.signup_int_day.show = val==1
        		this.column_keys.signup_amount.show = val==1
        		this.column_keys.performance_eid.show = val==1
        		this.column_keys.intention_level.show = val==0
        	},
        	'type_customer': function(val) {
        		let tag_id = this.$route.query.tag_id
        		if(tag_id) {
        			this.tag_id = tag_id
        		}
        		this.init_data()
        	},
        	'$route'(to,from) {
                this.tag_id = to.query.tag_id
                this.init_data()
            }
        }        
	}
</script>