<style lang="less">
	.custom-form-item-required .ivu-form-item-label:before {
		content: '*';
		display: inline-block;
		margin-right: 4px;
		line-height: 1;
		font-family: SimSun;
		font-size: 12px;
		color: #f30;			
	}
</style>
<template>
	<Modal v-drag-modal :mask-closable="false" width="680" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<Form :label-width="100" ref="form" :model="info">
			<div>
			<Tabs v-model="current_tab">
				<TabPane name="basic" label="基础">
		        	<div class="row">
			        	<div class="form-container col-md-12 col-xs-12">
			        		<Row>
								<Col span="16">
									<Form-item prop="lesson_name" class="half custom-form-item-required" label="课程名称">
										<Input v-model="info.lesson_name" v-tabindex="1" placeholder="请输入课程名称"></Input>
									</Form-item>
								</Col>
								<Col span="8">
									<Form-item prop="lesson_no" class="half" label="课程编号">
										<Input v-model="info.lesson_no" v-tabindex="2" placeholder="编号"></Input>
									</Form-item>
								</Col>
							</Row>

							<Row>
								<Col span="8">
									<Form-item prop="is_package" class="custom-form-item-required" label="适用科目">
										<select-subject v-model="info.sj_ids" :clearable="true"/>
									</Form-item>
								</Col>
								<Col span="8">
									<Form-item prop="is_standard" class="custom-form-item-required" label="标准课程">
										<RadioGroup v-model="info.is_standard" type="button">
									        <Radio :label="1" :true-value="1">是</Radio>
									        <Radio :label="0" :true-value="0">否</Radio>
									    </RadioGroup>
									</Form-item>
								</Col>
								<Col span="8" v-if="isDemo==0">
									<Form-item prop="is_package" label="课时包" v-help="'课时包可用于一对一、一对多以及班课上课考勤'">
										<RadioGroup v-model="info.is_package" type="button" @on-change="handleLessonIsPackage">
									        <Radio :disabled="modal$.action=='edit'" :label="1" :true-value="1">是</Radio>
									        <Radio :disabled="modal$.action=='edit'" :label="0" :true-value="0">否</Radio>
									    </RadioGroup>
									</Form-item>
								</Col>
							</Row>

							<Form-item prop="fit_grade_start" class="custom-form-item-required" label="适用年级" v-if="enable_grade">
								<Row>
									<Col span="10">
										<Select v-model="info.fit_grade_start" placeholder="" @on-change="fitGradeStartChange">
											<Option :value="item.name" v-for="item in grades">{{item.title}}</Option>
										</Select>
									</Col>
									<Col span="2">
										<p class="text-center">~</p>
									</Col>
									<Col span="10">
										<Select v-model="info.fit_grade_end" placeholder="" :disabled="!info.fit_grade_start">
											<Option v-show="parseInt(item.name)>=parseInt(info.fit_grade_start)" :value="item.name" v-for="item in grades">{{item.title}}</Option>
										</Select>
									</Col>
								</Row>
							</Form-item>

							<Row v-if="!info.is_package && isDemo==0">
								<Col span="16">
									<Form-item prop="lesson_type" class="custom-form-item-required" label="授课方式">
										<RadioGroup v-model="info.lesson_type" type="button" @on-change="lessonTypeChange">
											<Radio :label="item" :disabled="modal$.action=='edit'" v-for="item in lesson_type">{{map_lesson_type[item]}}</Radio>
									    </RadioGroup>
									</Form-item>
								</Col>
							</Row>

							<Row v-if="isDemo==0">
								<Col span="16">
									<Form-item prop="price_type" class="custom-form-item-required" label="计费方式">
										<RadioGroup 
											v-model="info.price_type" 
											type="button"
											@on-change="priceTypeChange"
											>
									        <Radio :label="1" :disabled="info.lesson_type < 3">按次</Radio>
									        <Radio :label="2" :disabled="info.lesson_type == 3">按课时</Radio>
									        <Radio :label="3" :disabled="info.lesson_type == 3||info.is_package==1">按月</Radio>
									    </RadioGroup>
									</Form-item>
								</Col>
								<Col span="8">
									<Form-item prop="unit_price" label="单价" :label-width="90">
										<span v-if="info.is_term==1">{{info.unit_price|to_round}}</span>
										<Input-number 
											:min="0" 
											v-model="info.unit_price" 
											v-tabindex="-1" 
											v-else
											@on-change="unitPriceChange">
										</Input-number>
										<span>元/{{price_unit}}</span>
									</Form-item>
								</Col>
							</Row>
							<Row>
								<Col :span="isDemo==0?16:8">
									<Form-item prop="is_term" class="custom-form-item-required" label="收费方式">
										<RadioGroup 
											v-model="info.is_term" 
											type="button"
											@on-change="termChange"
											v-if="isDemo==0">
									        <Radio :label="1">按期收费</Radio>
									        <Radio :label="0">按{{term_unit}}</Radio>
									    </RadioGroup>
										<template v-if="info.is_term == 1">
											<Input-number 
												:min="1" 
												v-model="info.lesson_nums" 
												v-tabindex="-1" 
												@on-change="lessonNumsChange"
												style="width:60px;">
											</Input-number>
											<span>{{term_unit}}/期</span>
										</template>
									</Form-item>
								</Col>
								<Col span="8">
									<Form-item prop="sale_price" label="售价" :label-width="90" v-if="info.is_term == 1">
										<InputNumber 
											v-model="info.sale_price" 
											:min="0" 
											v-tabindex="-1" 
											@on-change="salePriceChange">
										</InputNumber>
										<span>元</span>
									</Form-item>
								</Col>
								<Col span="8" v-if="isDemo==1">
									<Form-item prop="unit_price" label="单价" :label-width="90">
										<span>{{info.unit_price|to_round}}</span>
										<span>元/{{price_unit}}</span>
									</Form-item>
								</Col>
							</Row>
							<Row v-if="info.price_type != 3 && info.lesson_type != 3">	
								<Col span="14">
									<Form-item prop="unit_lesson_minutes" class="custom-form-item-required" label="课耗定义">
										<span>单次课时长</span>
										<Input-number :step="15" :min="1" v-model="info.unit_lesson_minutes" v-tabindex="-1" style="width:50px;">
										</Input-number>
										<span>分钟,扣</span>
										<Input-number 
											:min="0" 
											v-model="info.unit_lesson_hours" 
											v-tabindex="-1" 
											style="width:50px;"
											@on-change="unitLessonHoursChange">
										</Input-number>
										<span>课时</span>
									</Form-item>
								</Col>
							</Row>
							
							<Row>
								<Col span="16">
									<Form-item prop="expire_month" label="有效期" :class="[{'custom-form-item-required':must_input_expire_day}]">
										<InputNumber v-model="info.expire_month" :min="0" style="80px"></InputNumber>
										<span>个月（0为不限制）</span>
									</Form-item>
								</Col>
								<Col span="8">
									<Form-item prop="status" label="状态" :label-width="90">
										<RadioGroup v-model="info.status" type="button">
									        <Radio :label="1" :true-value="1">启用</Radio>
									        <Radio :label="0" :true-value="0">停用</Radio>
									    </RadioGroup>
									</Form-item>
								</Col>
							</Row>
						</div>
					</div>
		        </TabPane>
		        <TabPane name="branch" label="校区">
		        	<Row>
						<Col span="24">
							<Form-item class="custom-form-item-required" label="授权校区">
								<select-branch v-model="info.bids" clearable :disabled="info.is_public==1" style="width: 200px"/>
								<Checkbox 
									class="ml-2" 
									v-model="info.is_public" 
									:true-value="1" 
									:false-value="0"
									@on-change="changePublic" 
									>
									适用所有校区
								</Checkbox>
							</Form-item>
						</Col>
					</Row>
		        </TabPane>
		        <TabPane name="project" label="项目" v-if="enable_project">
		        	<Row>
						<Col span="24">
							<Form-item class="custom-form-item-required" label="所属项目">
								<Select style="width:200px" placeholder="项目" v-model="info.pj_id">
	          						<Option v-for="item in projects" :value="item.pj_id" :key="item.pj_id">
											{{item.pj_name}}
									</Option>
        						</Select>								
							</Form-item>
						</Col>
					</Row>
		        </TabPane>						
		        <TabPane name="intro" label="介绍">
		        	<div class="row" v-show="current_tab == 'intro'">
			        	<div class="form-container col-md-12 col-xs-12">
			        		<Form-item class="half" label="课程封面">
								<div class="img-upload">
									<div class="img-thumb">
							            <Icon type="camera" size="30" v-if="info.lesson_cover_picture == ''" style="line-height: inherit;"></Icon>
							            <img :src="info.lesson_cover_picture" @click="handleUploadImgView" v-else>
							        </div>
						        </div>
								<c-upload
									v-model="info.lesson_cover_picture"
									btn-text="上传"
								>
								</c-upload>
			    			</Form-item>
				        	<Form-item label="课程简介">
								<Input 
								v-model="info.short_desc" 
								v-tabindex="2" type="textarea" 
								:autosize="{minRows: 2,maxRows: 5}" 
								placeholder="课程的简要介绍..."
								>
								</Input>
							</Form-item>
							<Form-item label="宣传文本" prop="public_content">
					        	<div class="table-wrap">
					        		<ueditor 
					        		class="ueditor" 
					        		ref="ueditor" 
					        		v-model="info.public_content" 
					        		:ueditor-config="ueconfig">
					        		</ueditor>				        	
					        	</div>
					        </Form-item>
			        	</div>
			        </div>
		        </TabPane>
		        <TabPane name="advance" label="高级">
		        	<div class="row">
			        	<div class="form-container col-md-12 col-xs-12">
			        		
							<Form-item prop="version" label="版本号">
								<Input v-model="info.version" v-tabindex="-1" placeholder="请输入版本号" style="width: 300px"></Input>
							</Form-item>

							<Form-item prop="product_level_did" label="课程级别">
								<Select v-model="info.product_level_did" style="width: 300px">
									<Option v-for="item in product_levels" :value="item.did">{{item.title}}</Option>
								</Select>
							</Form-item>
							
							<Form-item prop="ability_did" label="课程能力" v-if="enable_lesson_ability">
								<Select v-model="info.ability_did">
									<Option v-for="item in abilities" :value="item.did">{{item.title}}</Option>
								</Select>
							</Form-item>

							<Form-item prop="year" label="年份">
	                            <Select v-model="info.year" :clearable="true" style="width: 300px">
	                                <Option v-for="item in years" :value="item">{{item}}</Option>
	                            </Select>
	                        </Form-item>

							<Form-item prop="season" label="期段">
	                            <Select v-model="info.season" :clearable="true" style="width: 300px">
	                                <Option v-for="item in seasons" :value="item.name">{{item.title}}</Option>
	                            </Select>
	                        </Form-item>
	                        <Form-item prop="is_online" label="线上课" v-if="enable_online_lesson">
	                            <i-switch v-model="info.is_online" :true-value="1" :false-value="0">
	                            </i-switch>
	                        </Form-item>

	                        <Form-item prop="teacher_level" label="老师星级" v-if="enable_teacher_level">
	                            <Select v-model="info.teacher_level" :clearable="true" style="width: 300px">
	                                <Option v-for="(item,index) in teacher_levels" :value="index">{{item.name}}</Option>
	                            </Select>
	                        </Form-item>
							
							<Form-item prop="leave_nums_limit" label="允许请假">
								<InputNumber v-model="info.leave_nums_limit" :min="-2"></InputNumber>
								<span>次（-1为全局限制，0为不限制，-2为不允许请假）</span>
							</Form-item>
	                        
						</div> 
					</div>
		        </TabPane>
				<TabPane name="stepPrice" label="阶梯定价" v-if="info.price_type == 2 && info.is_term == 0">
					<div>	
                <Row>
	            	<Col span="24">
	            		<table class="modal-table">
	            			<thead>
	            				<tr>
	            					<th><div class="ivu-table-cell">阶梯</div></th>
									<th><div class="ivu-table-cell">定价</div></th>
									<th><div class="ivu-table-cell">操作</div></th>
	            				</tr>
	            			</thead>
	            			<tbody>
	            				<tr v-for="(item,index) in info.step_price_define" :key="index">
	            					<td align="left">
										<div class="ivu-table-cell">
											第
											<InputNumber v-model="item.start" :step="1" :min="1" style="width:70px;"></InputNumber>
											个课时 ~ 第
											<InputNumber v-model="item.end" :step="1" :min="1" style="width:70px;"></InputNumber>
											个课时
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<InputNumber v-model="item.price" :step="1" :min="1" style="width:100px;"></InputNumber>
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<Button type="text" icon="ios-trash" @click="remove_step_price_define(index)"></Button>
	                    				</div>
									</td>
	            				</tr>
	            				<tr>
	            					<td colspan="3" class="text-center"><i class="ivu-icon ivu-icon-plus" style="cursor: pointer;" @click="add_step_price_define">&nbsp;添加</i></td>
	            				</tr>
	            			</tbody>
	            		</table>
	            	</Col>
	            </Row>
			</div>
				</TabPane>
			</Tabs>
			</div>
    	</Form>    
	   
		<div slot="footer">
			<Button type="ghost" :disabeld="saving" @click="close">取消</Button>
			<Button type="primary" :loading="saving" @click="checkForm">确认</Button>
		</div>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
	import Ueditor from 'c%/Ueditor'
	import SelectSubject from 'c%/SelectSubject.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import cUpload from 'c%/cUpload.vue'
	
	const INFO_NAME  = '课程'
	const INFO_PK_ID = 'lid'
	const INFO_URL   = 'lessons'

	const emptyObject = {
		version: '',
		chapter_nums: 1,					
		lesson_name: '',
		lesson_no:'',
		year: '',
		season: '',
		bids: [],
		is_public: 1,
		sj_id: 0,
		sj_ids: [],
		short_desc: '',					
		product_level_did: 0,
		lesson_type: 0,
		is_multi_class: 0,
		as_class_nums: 2,
		price_type: 2,
		is_term: 1,
		lesson_nums: 1,
		unit_lesson_hours: 1,
		fit_age: [0,0],
		fit_grade: [0,0],
		unit_price: 0.00,
		sale_price: 0,
		unit_lesson_minutes: 60,
		public_content: '',
		lesson_cover_picture: '',
		is_package: 0,
		status: 1,
		ability_did: 0,
		fit_grade_start: 0,
		fit_grade_end: 0,
		is_demo: 0,
		expire_month: 0,
		leave_nums_limit: -1,
		is_online: 0,
		pj_id:0,
		is_standard: 1,
		step_price_define:[]
	}
	
	export default{
		name:'lessonInfoModal',
		mixins:[common,globals,directive,modal],
		components: {
			cUpload,
			Ueditor,
			SelectSubject,
			SelectBranch
		},
		props: {
			isDemo: {
				type: Number,
				default: 0
			}
		},
		filters: {
			to_round(v) {
				return Math.round(util.float(v) * 100)/100
			}
		},
		data () {
			return {
				current_tab:'basic',
				imgview:false,
				info: util.copy(emptyObject),
				rules: {
					lesson_name: [
						{ required: true, message: '请输入课程名称', trigger: 'blur' }
					]
                },
                is_copy: 0
			}
		},	
		mounted () {
			
		},
		watch:{
	        'modal$.show': {
	        	handler: function (val){
	        		if(val&&this.modal$.action=='add'){	        	
                        if(this.is_copy == 0){
                            this.info = util.copy(emptyObject)
	        			    this.info.is_demo = this.isDemo
                        }else{
                            this.info.lid = 0
                        }
	        		}
	        	}
	        }
		},
		methods : {
			add_step_price_define(){
				let start = this.info.step_price_define.length > 0 ? this.info.step_price_define[this.info.step_price_define.length - 1].end + 1 : 1

				let data = {
					start:start,
					end:start + 1,
					price:0
				}

				this.info.step_price_define.push(data)
			},
			remove_step_price_define(index){
				this.info.step_price_define.splice(index,1)
			},
			changePublic(v) {
				if(v) {
					this.info.bids.splice(0)
				}
			},
			fitGradeStartChange(v) {
				if(!this.info.fit_grade_end){
        			this.info.fit_grade_end = v
        			return
        		}
        		if(parseInt(this.info.fit_grade_end) < parseInt(v)){
        			this.info.fit_grade_end = v
        		}
			},
			unitLessonHoursChange(v) {
				this.cacu_chapter_nums()
			},
			lessonTypeChange(v) {
				if(v == 3){
        			this.info.price_type = 1
        			this.info.chapter_nums = 1
        		}else{
        			this.info.price_type = 2
        		}
			},
			priceTypeChange(v) {
				this.cacu_chapter_nums()
			},
			termChange(v) {
				if(v == 1){
        			this.cacu_chapter_nums()
        		}else{
        			this.info.lesson_nums = 1
        		}
        		this.info.sale_price = 0
        		this.info.unit_price = 0
			},
			lessonNumsChange(v) {
				this.cacu_chapter_nums()
	        	this.cacu_unit_price()
			},
			unitPriceChange(v) {
				this.cacu_sale_price()
			},
			salePriceChange(v) {
				this.cacu_unit_price()
			},
			cacu_sale_price(){
				this.info.sale_price = this.info.unit_price
			},
			cacu_unit_price() {
				if(this.info.is_term == 1) {
					this.info.unit_price = (this.info.sale_price / this.info.lesson_nums).toFixed(6)
				}
			},
			cacu_chapter_nums(){
				if(this.info.lesson_nums == 0){
					this.info.lesson_nums = 1
				}
			},
			handleLessonIsMulti(value) {
				if(value == 1) {
					this.info.as_class_nums = 2
				}else{
					this.info.as_class_nums = 1
				}
			},
			handleLessonIsPackage(value) {
				if(value == 1) {
					this.info.lesson_type = 0
					this.info.price_type = 2
				}
			},
			handleReset (name) {
				this.$refs[name].resetFields();
			},
		    handleUploadImgView () {
                this.imgview = true;
            },
            checkForm(){
            	if(this.info.lesson_name == ''){
            		this.current_tab = 'basic'
            		this.$Message.error('请输入课程名称!')
            		return false           	
            	}
            	
            	if(!this.info.sj_ids.length){
        			this.$Message.error('请选择课程适用科目')
        			return false            		
            	}

            	if(this.enable_grade){
					if(this.info.fit_grade_start == 0){
						this.$Message.error('请选择适用年级!');
						return false
					}
					if(this.info.fit_grade_end == 0){
						this.$Message.error('请选择适用年级!');
						return false
					}
					if(this.info.fit_grade_start > this.info.fit_grade_end){
						this.$Message.error('结束年级不能大于开始年级!');
						return false
					}
					this.info.fit_grade[0] = this.info.fit_grade_start
					this.info.fit_grade[1] = this.info.fit_grade_end
				}

            	if(this.info.unit_lesson_hours == 0){
            		this.$Message.error('单次课扣课时数不能为0');
            		this.current_tab = 'basic'
            		return false
            	}

            	if(this.info.bids.length == 0 && this.info.is_public == 0){
            		this.$Message.error('请选择适用校区');
            		this.current_tab = 'branch'
            		return false
            	}
            	if(this.enable_project){
            		if(this.info.pj_id == 0){
            			this.$Message.error('请选择所属项目');
            			this.current_tab = 'project'
            			return false
            		}
            	}

            	if(this.must_input_expire_day && this.info.expire_month == 0){
            		this.$Message.error('请输入有效期');
            		this.current_tab = 'basic'
            		return false
				}

				let errorCount = 0
				this.info.step_price_define.forEach(data => {
					if(data.start == null || data.end == null || data.price == null){
						errorCount += 1
					}
				})
				if(errorCount > 0){
					this.$Message.error('阶梯定价输入有误');
            		this.current_tab = 'stepPrice'
            		return false
				}

            	this.save()
            	
            }
		},
		computed: {
			lesson_type () {
				let configs = this.$store.state.gvars.configs
								
				return configs.params.lesson.enable_lesson_type
			},
			abilities () {
				return this.dicts('lesson_ability')
			},
			end_grades(){
				return grades.filter(item=>{
					if(this.info.fit_grade_start !=0){
						return item.name >= this.info.fit_grade_start
					}
					return true
				})
			},
			info_url$(){
            return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        },
			product_levels(){
				return this.$store.state.gvars.dicts.product_level
			},
			upload_header(){
                return {
                    'x-token':this.$store.state.user.token,
                    'x-file-key':'file'
                }
            },
            upload_post(){
                return {
                    mod:'lesson_cover_picture'
                }
            },
            years() {
				let now = (new Date()).getFullYear()
				return [now+2, now+1, now, now-1, now-2]
			},
			term_unit() {
				let map = {1: '次', 2: '课时', 3: '月'}
				return map[this.info.price_type]
			},
			price_unit() {
				return this.term_unit
			},
			seasons(){
				return this.$store.state.gvars.dicts.season
			},
			ueconfig(){
	            return {
	                toolbars: [
	                    ['simpleupload', 
	                    'insertimage', 
	                    'link', 
	                    'spechars', 
	                    'justifyleft', 
	                    'justifyright', 
	                    'justifycenter', 
	                    'justifyjustify', 
	                    'undo', 
	                    'redo', 
	                    'bold']
	                ],
	                elementPathEnabled: false,
	                wordCount: false,           
	                initialFrameHeight: 300,
	                initialFrameWidth: 548,
	                imagePathFormat: '/upload',
	                enableAutoSave: false,
	                autoHeightEnabled: true,
	                zIndex: 2999,
	            }
	        }
		}
	}
</script>